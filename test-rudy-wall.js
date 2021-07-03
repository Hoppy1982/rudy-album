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
const cssOutputPath = path.resolve('./dist2/css/built-rudy-gallery.css');

/* Vars */
const baseImagesJSON = fs.readFileSync(baseImagesJSONPath);
const baseImagePaths = JSON.parse(baseImagesJSON).images.map(image => image.url);
const options = {
	baseImagePaths: baseImagePaths,
	imageOutputConfigs: imageOutputConfigs,
	imageFilesInfoPath: imageFilesInfoPath,
	cssOutputPath: cssOutputPath
};
const rudyWall1 = new rudyWall(options);


/* Run */
(async () => {
	// Clean
	fs.rmdirSync(cssOutputPath, { recursive: true })

	const imageFilesInfo = await rudyWall1.getImageFilesInfo();
	const imagePatternsInfos = rudyWall1.getImageInfoAtPatterns(imageFilesInfo);
	rudyWall1.writeCssCustomPropertiesToFile(imagePatternsInfos);

	imagePatternsInfos.forEach(imagePatternsInfo => {
		console.log(imagePatternsInfo);
	})

	//rudyWreturnall1.getCss();
	console.log('Complete');
})();


