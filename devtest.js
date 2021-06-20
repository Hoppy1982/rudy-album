const path = require('path');
const fs = require('fs');
const sizeOf = require('image-size');


/* 
 * Config 
 */
/* List image urls below in source order */
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
const itemName = "rudyCard";
const outputPath = path.join(__dirname, "styles/generated-rudy-aspect-ratios.css");
let breakpointPatterns = [
	{
		bp: 481,
		pattern: [2, 1, 2]
	},
	{
		bp: 781,
		pattern: [3, 2, 1, 2]
	}
]
const breakpoints = [481, 781];
const patterns = [
	[2, 1, 2],
	[3, 2, 1, 2]
];


/* Vars */
const imageAspects = imageUrls.map(url => {
	const { width, height } = sizeOf(url);
	return width / height;
});
const patternLengths = patterns.map( pattern => pattern.reduce((acc, curr) => acc + curr) );
const cssStringsToOutput = [];


validateInput();
const masonaryItems = getMasonaryItemsData();
//generateCssRules();
//saveCssFile();

// debug
masonaryItems.forEach(item => {
	console.log(item);
});


/* NEXT: work out how to name all the custom properties, --itemNameX-bpXXX
generate custom properties and media queries & output to file */


/*
 *
 */
function validateInput() {
	// TODO - finish
	if (breakpoints.length !== patterns.length)
		throw `Input Error: Number of patterns (${patterns.length}) did not match number of breakpoints (${breakpoints.length})`;
}


/*
 *
 */
function getMasonaryItemsData() {
	return imageUrls.map((imageUrl, imageInd) => {
		const masonaryItem = {
			image: imageInd,// temp
			url: imageUrl,// temp
			aspect: imageAspects[imageInd]// temp
		};
	
		patterns.forEach((pattern, iPattern) => {
			masonaryItem[ breakpoints[iPattern] ] = {};
			const patternPos = imageInd % patternLengths[iPattern];
	
			const sliceInfo = pattern.map(rowLength => {
				return [...new Array(rowLength)].map((el, i) => {
					return {index: i, rowLength: rowLength}
				});
			}).flat();
	
			const sliceLeft = sliceInfo[patternPos].index;
			const sliceRight = sliceInfo[patternPos].rowLength - sliceLeft;
			const siblingAspects = imageAspects.slice(imageInd - sliceLeft, imageInd + sliceRight);
			const siblingAspectSum = siblingAspects.reduce((acc, curr) => acc + curr);
			// nGutters
			// nBorders
	
			masonaryItem[ breakpoints[iPattern] ].index = sliceInfo[patternPos].index;// temp
			masonaryItem[ breakpoints[iPattern] ].rowLength = sliceInfo[patternPos].rowLength;// temp
			masonaryItem[ breakpoints[iPattern] ].siblingAspectSum = siblingAspectSum;// temp
			masonaryItem[ breakpoints[iPattern] ].widthRatio = `${imageAspects[imageInd]}/${siblingAspectSum}`;
		});
	
		return masonaryItem;
	});
}


/*
 * Removes existing file if exists then writes each css rule from cssStringsToOutput[]
 */
function generateCssRules() {
	
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

