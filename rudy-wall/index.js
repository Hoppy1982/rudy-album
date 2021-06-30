/* Cfg */
// const baseImagesJSONPath = './src/data/gallery-images.json';
// const imageOutputConfigs = [
// 	{ width: 300, quality:  80, destPath: './dist/assets/images/rudy-300' },
// 	{ width: 480, quality:  80, destPath: './dist/assets/images/rudy-480' },
// 	{ width: 800, quality:  80, destPath: './dist/assets/images/rudy-800' },
// 	{ width: 1200, quality:  80, destPath: './dist/assets/images/rudy-1200' }
// ];
// const imagesMetaDestPath = './dist/data/imagesMeta.json';


// const itemCustomPropertyName = "rudyCard";
// const itemCssClass = "rudy-cards__card";
// const cssGutterWidthVarName = '--gutter';
// const cssBorderWidthVarName = '--borderWidth';
// const cssPaddingWidthVarName = '--paddingWidth';

// const outputPath = "./dist/styles/built-rudy-gallery.css";
// const breakpoints = [340, 600, 980];
// const patterns = [
// 	[1, 2],
// 	[2, 3],
// 	[3, 4, 5]
// ];

// INPUT

//OUTPUT
// optimized images in sub dirs
// json meta


// INPUT
// json meta
// patterns
// bps
// css stuff

//OUTPUT
// css file with custom properties & media queries


export default class RudyWall {
	constructor({
		baseImagePaths,
		outputImages,
		outputMeta,
		breakpoints,
		patterns
	} = {
		baseImagePaths: [],
		outputImages: [
			{ width: 300, quality: 80, destPath: './rw-default-output/images/rw300'},
			{ width: 600, quality: 80, destPath: './rw-default-output/images/rw600'}
		],
		outputMeta: './rw-default-output/meta.json',
		breakpoints: [340, 600, 980],
		patterns: [ [1,2], [2,3], [3,4,5] ]
	})
	{
		this.baseImagePaths = baseImagePaths;
		this.outputImages = outputImages;
		this.breakpoints = breakpoints;
		this.patterns = patterns;
	}


}