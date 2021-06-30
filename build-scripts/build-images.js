import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

/* Cfg */
const baseImagesJSONPath = './src/data/gallery-images.json';
const imageOutputConfigs = [
	{ width: 300, quality:  80, destPath: './dist/assets/images/rudy-300' },
	{ width: 480, quality:  80, destPath: './dist/assets/images/rudy-480' },
	{ width: 800, quality:  80, destPath: './dist/assets/images/rudy-800' },
	{ width: 1200, quality:  80, destPath: './dist/assets/images/rudy-1200' }
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
		if ( !fs.existsSync( path.dirname(imagesMetaDestPath)) )
			fs.mkdirSync( path.dirname(imagesMetaDestPath) );

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
				const fName = path.basename(baseImage.url, ext).split(" ").join("");
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
							url: outputPath.replace('./dist', '.')
						};
						resolve();
					})
					.catch(err => { reject(err); });
			}));
		}
		imageDatas.push(imageData);
	}

	return Promise.all(promises)
		.then(() => {
			return imageDatas;
		})
}