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
		breakpoints = [340, 600, 980],
		patterns = [ [1,2], [2,3], [3,4,5] ],
		imageFilesInfo,
		cssClass = 'rw-card',
		cssGutterWidthName = 'rw-card-gutter-width',
		cssBorderWidthName = 'rw-card-border-width',
		cssPaddingWidthName = 'rw-card-padding-width'
	})
	{
		this.baseImagePaths = baseImagePaths;
		this.imageOutputConfigs = imageOutputConfigs;
		this.breakpoints = breakpoints;
		this.patterns = patterns;
		this.imageFilesInfo = imageFilesInfo;
		this.cssClass = cssClass;
		this.cssGutterWidthName = cssGutterWidthName;
		this.cssBorderWidthName = cssBorderWidthName;
		this.cssPaddingWidthName = cssPaddingWidthName;
		// Calculated
		this.patternLengths = this.patterns.map( pattern => pattern.reduce((acc, curr) => acc + curr) );
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
	 * Uses (this.imageFilesInfo, this.patterns)
	 */
	getImageInfoAtPatterns() {
		return this.imageFilesInfo.map((fileInfo, fileInfoIndex, arr) => {
			const masonaryItem = {
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
	
				let sliceLeft = sliceInfo[patternPos].index;
				let sliceRight = sliceInfo[patternPos].rowLength - sliceLeft;
	
				let deficit = 0;
				while( fileInfoIndex + sliceRight - deficit > arr.length)
					deficit+=1;
				
				const siblings = arr.slice(fileInfoIndex - sliceLeft, fileInfoIndex + sliceRight - deficit);
				const siblingsAspectSum = siblings.reduce((acc, curr) => {
					return acc + curr.aspect
				},0);
				const nGutters = sliceInfo[patternPos].rowLength - deficit - 1;
				const nBorders = (sliceInfo[patternPos].rowLength - deficit) * 2;

				breakpointData.positionInRow = sliceInfo[patternPos].index;
				breakpointData.rowLength = sliceInfo[patternPos].rowLength;
				breakpointData.fractionOfRow = `${fileInfo.aspect}/${siblingsAspectSum}`;
				breakpointData.nGutters = nGutters;
				breakpointData.nBorders = nBorders;
				breakpointData.rowDeficit = deficit;
				masonaryItem.rowInfo.push(breakpointData);
			});
		
			return masonaryItem;
		});
	}


	/*
	 * 
	 */
	getCss() {
		console.log('getCss..');
	}
}