import fs from 'fs';
import path from 'path';
import rudyWall from "./rudy-wall/index.js";

/* Config */
const baseImagesJSONPath = './src/data/gallery-images.json';
const imageOutputConfigs = [
	{ width: 300, quality:  80, destPath: path.resolve('./dist2/images/rw300') },
	{ width: 480, quality:  80, destPath: path.resolve('./dist2/images/rw480') },
	{ width: 800, quality:  80, destPath: path.resolve('./dist2/images/rw800') },
	{ width: 1200, quality:  80, destPath: path.resolve('./dist2/images/rw1200') }
]
const imageFilesInfoPath = path.resolve('./dist2/data/imageFilesInfo.json');

/* Vars */
const baseImagesJSON = fs.readFileSync(baseImagesJSONPath);
const baseImagePaths = JSON.parse(baseImagesJSON).images.map(image => image.url);
const options = {
	baseImagePaths: baseImagePaths,
	imageOutputConfigs: imageOutputConfigs,

}

/* Init */
const rudyWall1 = new rudyWall(options);

// Example
// const imageFilesInfo = rudyWall1.generateImages(baseImagePaths, imageOutputConfig);
// const imageWidthsAtPatterns = rudyWall1.imageWidthsAtPatterns( imageFilesInfo, patterns )
// const { cssCustomProps, mediaQueries } = rudyWall1.generateCss( breakpoints, cssStuff)

/* Run */
(async () => {
	rudyWall1.imageFilesInfo = await getImageFilesInfo(rudyWall1, imageFilesInfoPath);

	rudyWall1.imageFilesInfo.forEach(imageInfo => {
		//console.log(JSON.stringify(imageInfo, null, 2));
	});

	const imagePatternsInfos = rudyWall1.getImageInfoAtPatterns();

	imagePatternsInfos.forEach(imagePatternsInfo => {
		console.log(imagePatternsInfo)
	})


	//rudyWall1.getCss();
})();



/*
 * Checks existance of json file to determine whether to generate images or
 * load image file info from json file.
 * Creates the json file after generating the images.
 * - Leave json file for quicker build (if images unchanged).
 * - Delete json file to re-build images (if images or cfgs changed).
 */
async function getImageFilesInfo(rudyWall, imageFilesInfoPath) {
	let imagesInfo = null;

	if ( fs.existsSync(imageFilesInfoPath) ) {
		let imagesInfoJSON = fs.readFileSync(imageFilesInfoPath);
		imagesInfo = JSON.parse(imagesInfoJSON);
	}
	else {
		imagesInfo = await rudyWall.generateImages();
		if ( !fs.existsSync( path.dirname(imageFilesInfoPath)) )
			fs.mkdirSync( path.dirname(imageFilesInfoPath), { recursive: true } );
		fs.writeFileSync( imageFilesInfoPath, JSON.stringify(imagesInfo, null, 2) );
	}

	return imagesInfo;
}