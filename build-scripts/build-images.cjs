const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

/* cfg */
const baseImagesJSONPath = './src/data/gallery-images.json';
const imageOutputConfigs = [
	{ width: 300, quality:  80, destPath: './dist/assets/images/rudy300' },
	{ width: 600, quality:  80, destPath: './dist/assets/images/rudy600' },
	{ width: 1000, quality:  80, destPath: './dist/assets/images/rudy1000' }
];

/* */
const baseImagesJSON = fs.readFileSync(baseImagesJSONPath);
const baseImageDatas = JSON.parse(baseImagesJSON);


const imagesData = createImages(baseImageDatas, imageOutputConfigs)
console.log(imagesData);



/*
 *
 */
function createImages(baseImageDatas, cfgs) {
	const imagesData = [];
	const promises = [];

	//for (const imageData of )

	baseImageDatas.images.forEach(baseImageData => {

		const imageData = {
			alt: baseImageData.alt,
			base: {
				url: baseImageData.url,
				width: null
			}
		}

		cfgs.forEach(cfg => {
			const ext = path.extname(baseImageData.url);
			const fName = path.basename(baseImageData.url, ext);
			const newFileName = `${fName}-${cfg.width}${ext}`;
			const outputPath = `${cfg.destPath}/${newFileName}`;

			if (!fs.existsSync(cfg.destPath))
				fs.mkdirSync(cfg.destPath);

			sharp(baseImageData.url)
				.resize(cfg.width)
				.jpeg({
					mozjpeg: true,
					quality: cfg.quality
				})
				.toFile(outputPath)
				.then(info => { sharpImageData = info; })
				.catch(err => { console.log(err); });
		});

		imagesData.push(imageData);
	});

	return imagesData;
}



// function createImages(baseImageDatas, cfgs) {
// 	const imagesData = [];

// 	baseImageDatas.images.forEach(baseImageData => {

// 		const imageData = {
// 			alt: baseImageData.alt,
// 			base: {
// 				url: baseImageData.url,
// 				width: null
// 			}
// 		}

// 		cfgs.forEach(cfg => {
// 			const ext = path.extname(baseImageData.url);
// 			const fName = path.basename(baseImageData.url, ext);
// 			const newFileName = `${fName}-${cfg.width}${ext}`;
// 			const outputPath = `${cfg.destPath}/${newFileName}`;

// 			if (!fs.existsSync(cfg.destPath))
// 				fs.mkdirSync(cfg.destPath);

// 			sharp(baseImageData.url)
// 				.resize(cfg.width)
// 				.jpeg({
// 					mozjpeg: true,
// 					quality: cfg.quality
// 				})
// 				.toFile(outputPath)
// 				.then(info => { sharpImageData = info; })
// 				.catch(err => { console.log(err); });
// 		});

// 		imagesData.push(imageData);
// 	});

// 	return imagesData;
// }

/*
 * Generate a context file with image paths, widths, heights, alt text and aspect ratio
 */