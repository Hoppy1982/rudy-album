const fs = require('fs');
const path = require('path');
const sharp = require('sharp');


/* Cfg */
const baseImagesJSONPath = './src/data/gallery-images.json';
const imageOutputConfigs = [
	{ width: 300, quality:  80, destPath: './dist/assets/images/rudy-300' },
	{ width: 600, quality:  80, destPath: './dist/assets/images/rudy-600' },
	{ width: 1000, quality:  80, destPath: './dist/assets/images/rudy-1000' }
];
const imagesMetaDestPath = './dist/data/imagesMeta.json';

/* Vars */
const baseImagesJSON = fs.readFileSync(baseImagesJSONPath);
const baseImages = JSON.parse(baseImagesJSON).images;


/* Run */
(async () => {
	const imagesMeta = await createImages(baseImages, imageOutputConfigs);
	const imagesMetaJSON = JSON.stringify(imagesMeta, null, 2);

	try {
		console.log(imagesMetaDestPath)
		if ( !fs.existsSync( path.dirname(imagesMetaDestPath)) )
			fs.mkdirSync( path.dirname(imagesMetaDestPath) )

		fs.writeFileSync(imagesMetaDestPath, imagesMetaJSON);
	}
	catch(err) { console.log(err); }
})()




/*
 *
 */
function createImages(baseImages, cfgs) {
	const promises = [];
	const imageDatas = [];

	for (const baseImage of baseImages) {
		const imageData = {
			alt: baseImage.alt,
			aspect: null,
			base: {
				url: baseImage.url
			}
		}

		sharp(baseImage.url)
			.metadata()
			.then(metadata => {
				imageData.aspect = metadata.width / metadata.height;
				imageData.base.width = metadata.width;
				imageData.base.height = metadata.height;
			});

		for (const cfg of cfgs) {
			promises.push(new Promise((resolve, reject) => {
				const ext = path.extname(baseImage.url);
				const fName = path.basename(baseImage.url, ext);
				const newFileName = `${fName}-${cfg.width}${ext}`;
				const outputPath = `${cfg.destPath}/${newFileName}`;

				if (!fs.existsSync(cfg.destPath))
					fs.mkdirSync(cfg.destPath);

				sharp(baseImage.url)
					.resize(cfg.width)
					.jpeg({
						mozjpeg: true,
						quality: cfg.quality
					})
					.toFile(outputPath)
					.then(info => {
						imageData[`w${cfg.width}`] = {
							width: info.width,
							height: info.height,
							url: `.${outputPath}`
						};
						imageDatas.push(imageData);
						resolve();
					})
					.catch(err => { reject(err); });
				
					
			}));
		}
	}

	return Promise.all(promises)
		.then(() => {
			return imageDatas;
		})
}