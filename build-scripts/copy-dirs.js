import * as fs from 'fs/promises';
import * as path from 'path';


/*
 *
 */
async function copyDir(src, dest) {
	await fs.mkdir(dest, { recursive: true });
	let entries = await fs.readdir(src, { withFileTypes: true });

	for (let entry of entries) {
		let srcPath = path.join(src, entry.name);
		let destPath = path.join(dest, entry.name);

		if ( entry.isDirectory() ) {
			await copyDir(srcPath, destPath)
		}
		else {
			await fs.copyFile(srcPath, destPath);
		}
	}
}


copyDir('./src/styles', './dist/styles');
copyDir('./src/scripts', './dist/scripts');
copyDir('./src/assets', './dist/assets');