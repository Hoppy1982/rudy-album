const path = require('path');
const fs = require('fs');
const sizeOf = require('image-size');


/* 
 * Config 
 */
/* List image urls below in html source order */
const imageUrls = [
	"./images/rudy-1200/rudy-1.jpg",
	"./images/rudy-1200/rudy-2.jpg",
	"./images/rudy-1200/rudy-3.jpg",
	"./images/rudy-1200/rudy-4.jpg",
	"./images/rudy-1200/rudy-5.jpg",
	"./images/rudy-1200/rudy-6.jpg",
	"./images/rudy-1200/rudy-7.jpg",
	"./images/rudy-1200/rudy-8.jpg",
	"./images/rudy-1200/rudy-9.jpg",
	"./images/rudy-1200/rudy-10.jpg"
	
]
const itemName = "rudy";
const maxPerRow = 6;
const outputPath = path.join(__dirname, "styles/generated-rudy-aspect-ratios.css");
const imageAspects = imageUrls.map(url => {
	let dimensions = sizeOf(url);
	return dimensions.width / dimensions.height;
});


/* Vars */
let cssStringsToOutput = [];


generateCssRules();
saveCssFile();


/*
 * Removes existing file if exists then writes each css rule from cssStringsToOutput[]
 */
function generateCssRules() {
	for (let i=2; i<=maxPerRow; i++) {
		imageAspects.forEach((aspect, ind, aspects) => {
			let rowOffsetLeft = ind%i;
			let rowOffsetRight = i - ind%i;
			let otherAspectsInSameRow = aspects.slice(ind - rowOffsetLeft, ind + rowOffsetRight);
			let tAspectsInRow = otherAspectsInSameRow.reduce((acc, curr) => acc + curr);
			cssStringsToOutput.push(`--x${i}PerRow-${itemName}${ind}: ${aspect}/${tAspectsInRow};`);
		});
		cssStringsToOutput.push('\n');
	}
}


/*
 * Removes existing file if exists then writes each css rule from cssStringsToOutput[]
 */
function saveCssFile() {
	if ( fs.existsSync(outputPath) )
		fs.unlinkSync(outputPath);

	fs.appendFileSync(outputPath, ':root {\n');
	cssStringsToOutput.forEach((cssString, ind) => {
		if (cssString !== '\n')
			fs.appendFileSync(outputPath, `\t${cssString}\n`);
		if (cssString === '\n') 
			fs.appendFileSync(outputPath, `\n`);
	});
	fs.appendFileSync(outputPath, '}');
}

