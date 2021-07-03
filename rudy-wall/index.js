import fs from 'fs';
import path from 'path';
import sharp from 'sharp';


export default class RudyWall {
	constructor({
		baseImagePaths,
		imageOutputConfigs = [
			{ width: 300, quality: 80, destPath: path.resolve('./rw-default-output/rw300') },
			{ width: 600, quality: 80, destPath: path.resolve('./rw-default-output/rw600') }
		],
		imageFilesInfoPath,
		cssOutputPath = './rw-default-output/css/built-gallery.css',
		breakpoints = [340, 600, 980],
		patterns = [ [1,2], [2,3], [3,4,5] ],
		cssClass = 'rw-card',
		cssGutterWidthName = 'rw-card-gutter-width',
		cssBorderWidthName = 'rw-card-border-width',
		cssPaddingWidthName = 'rw-card-padding-width'
	})
	{
		this.baseImagePaths = baseImagePaths;
		this.imageOutputConfigs = imageOutputConfigs;
		this.imageFilesInfoPath = imageFilesInfoPath;
		this.cssOutputPath = cssOutputPath;
		this.breakpoints = breakpoints;
		this.patterns = patterns;
		this.cssClass = cssClass;
		this.cssGutterWidthName = cssGutterWidthName;
		this.cssBorderWidthName = cssBorderWidthName;
		this.cssPaddingWidthName = cssPaddingWidthName;
		// Calculated
		this.patternLengths = this.patterns.map( pattern => pattern.reduce((acc, curr) => acc + curr) );
	}


	/*
	 * 
	 */
	async getImageFilesInfo() {
		// TODO - add prompt to create files if no json instead of just doing it?
		let imagesInfo = null;
		let JSONFileExists = fs.existsSync(this.imageFilesInfoPath);

		if (JSONFileExists) {
			let imagesInfoJSON = fs.readFileSync(this.imageFilesInfoPath);
			imagesInfo = JSON.parse(imagesInfoJSON);
		}
		else {
			console.log(`Missing JSON file, no image data. Creating images & JSON..`);
			imagesInfo = await this.generateImages();
			if ( !fs.existsSync( path.dirname(this.imageFilesInfoPath)) )
				fs.mkdirSync( path.dirname(this.imageFilesInfoPath), { recursive: true } );
			fs.writeFileSync( this.imageFilesInfoPath, JSON.stringify(imagesInfo, null, 2) );
		}

		return imagesInfo;
	}


	/*
	 * Writes new images of size and quality determined by imageOutputConfigs
	 */
	async generateImages() {
		const promises = [];
		const imageFilesInfo = [];
 
		for (const baseImagePath of this.baseImagePaths) {
			const imageFileInfo = {
				aspect: null,
				sizes: []
			}

			sharp(baseImagePath)
				.metadata()
				.then(metadata => {
					imageFileInfo.aspect = metadata.width / metadata.height;
				});

			for (const cfg of this.imageOutputConfigs) {
				promises.push(new Promise((resolve, reject) => {
					const ext = path.extname(baseImagePath);
					const fName = path.basename(baseImagePath, ext).split(' ').join('');
					const newFileName = `${fName}-${cfg.width}${ext}`;
					const outputPath = path.resolve( `${cfg.destPath}/${newFileName}` );

					if (!fs.existsSync(cfg.destPath))
						fs.mkdirSync(cfg.destPath, { recursive: true });

					sharp(baseImagePath)
						.resize(cfg.width)
						.jpeg({ mozjpeg: true, quality: cfg.quality })
						.toFile(outputPath)
						.then(info => {
							imageFileInfo.sizes.push({
								width: info.width,
								height: info.height,
								path: outputPath
							});
							resolve();
						})
						.catch(err => { reject(err); });
				}));
			}
			imageFilesInfo.push(imageFileInfo);
		}

		return Promise.all(promises)
			.then( () => imageFilesInfo );
	}


	/*
	 *
	 */
	getImageInfoAtPatterns(imageFilesInfo) {
		return imageFilesInfo.map((fileInfo, fileInfoIndex, arr) => {
			const rudyWallItem = {
				fileInfoIndex: fileInfoIndex,
				files: fileInfo.sizes.map( size => path.basename( size.path ) )  ,
				aspect: fileInfo.aspect,
				rowInfo: []
			};
		
			this.patterns.forEach((pattern, patternIndex) => {
				const breakpointData = {};
				const patternPos = fileInfoIndex % this.patternLengths[patternIndex];
		
				const sliceInfo = pattern.map(rowLength => {
					return [...new Array(rowLength)].map((el, i) => {
						return {index: i, rowLength: rowLength}
					});
				}).flat();
	
				const sliceLeft = sliceInfo[patternPos].index;
				const sliceRight = sliceInfo[patternPos].rowLength - sliceLeft;
	
				let deficit = 0;
				while( fileInfoIndex + sliceRight - deficit > arr.length)
					deficit+=1;
				
				const siblings = arr.slice(fileInfoIndex - sliceLeft, fileInfoIndex + sliceRight - deficit);
				const siblingsAspectSum = siblings.reduce((acc, curr) => { return acc + curr.aspect }, 0);

				breakpointData.positionInRow = sliceInfo[patternPos].index;
				breakpointData.rowLength = sliceInfo[patternPos].rowLength;
				breakpointData.rowDeficit = deficit;
				breakpointData.fractionOfRow = `${fileInfo.aspect}/${siblingsAspectSum}`;
				breakpointData.nGutters = sliceInfo[patternPos].rowLength - deficit - 1;
				breakpointData.nBorders = (sliceInfo[patternPos].rowLength - deficit) * 2;

				rudyWallItem.rowInfo.push(breakpointData);
			});
		
			return rudyWallItem;
		});
	}


	/*
	* Generates and writes css custom properties to file for each item at each pattern
	*/
	writeCssCustomPropertiesToFile(imagePatternsInfos) {
		const cssDirName = path.dirname( this.cssOutputPath );
		if (!fs.existsSync(cssDirName))
			fs.mkdirSync(cssDirName, { recursive: true });

		fs.appendFileSync(this.cssOutputPath, `:root {\n`);

		for (let patternIndex=0; patternIndex<this.patterns.length; patternIndex++) {
			imagePatternsInfos.forEach((imagePatternsInfo, imagePatternsInfoIndex)  => {
				const fractionOfRow = `${imagePatternsInfo.rowInfo[patternIndex].fractionOfRow}`;
				const gutterSpace = `${imagePatternsInfo.rowInfo[patternIndex].nGutters} * var(--${this.cssGutterWidthName})`;
				const borderSpace = `${imagePatternsInfo.rowInfo[patternIndex].nBorders} * var(--${this.cssBorderWidthName})`;
				const paddingSpace = `${imagePatternsInfo.rowInfo[patternIndex].nBorders} * var(--${this.cssPaddingWidthName})`;
				const totalSpace = `( (${gutterSpace}) + (${borderSpace}) + (${paddingSpace}) )`;
				const customPropName = `${this.cssClass}${imagePatternsInfoIndex+1}-bp${this.breakpoints[patternIndex]}-width`;
				const customPropVal = `calc( (100% - ${totalSpace}*1px) * ${fractionOfRow} )`;

				fs.appendFileSync(this.cssOutputPath, `\t--${customPropName}: ${customPropVal};\n`);
			});
			fs.appendFileSync(this.cssOutputPath, `\n`);
		}

		fs.appendFileSync(this.cssOutputPath, `}`);
		fs.appendFileSync(this.cssOutputPath, `\n\n`);
	}


	/*
	 * Generates media queries and writes to file.
	.*/
	writeMediaQueriesToFile(imagePatternsInfos) {
		this.breakpoints.forEach((breakpoint, i) => {
			fs.appendFileSync(this.cssOutputPath, `@media screen and (min-width: ${breakpoint}px) {\n`);

			imagePatternsInfos.forEach((imagePatternsInfo, ii) => {
				const customPropName = `${this.cssClass}${ii+1}-bp${this.breakpoints[i]}-width`;
				fs.appendFileSync(this.cssOutputPath,
					`\t.${this.cssClass}:nth-of-type(${ii+1}) {` + 
					` width: var(--${customPropName}); ` +
					`}\n`
				);
			});

			fs.appendFileSync(this.cssOutputPath, `}\n`);
		});
	}
}