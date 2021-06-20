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
const xbreakpoints = [481, 781];
const xPatterns = [
	[2, 1, 2],
	[3, 2, 1, 2]
];


/* Vars */
const imageAspects = imageUrls.map(url => {
	const { width, height } = sizeOf(url);
	return width / height;
});
const patternLengths = xPatterns.map( pattern => pattern.reduce((acc, curr) => acc + curr) );
const cssStringsToOutput = [];


validateInput();

/* Pre-calc */
breakpointPatterns = breakpointPatterns.map(bpPattern => {
	return {
		bp: bpPattern.bp,
		pattern: [...bpPattern.pattern],
		patternSum: bpPattern.pattern.reduce((acc, curr) => acc + curr)
	}
})


const masonaryItems = imageUrls.map((imageUrl, imageInd) => {
	let masonaryItem = {
		image: imageInd,// temp
		url: imageUrl,// temp
		aspect: imageAspects[imageInd]// temp
	};

	breakpointPatterns.forEach((bpPattern, iPattern) => {
		masonaryItem[bpPattern.bp] = {};
		let patternPos = imageInd % patternLengths[iPattern];

		let sliceInfo = bpPattern.pattern.map(rowLength => {
			return [...new Array(rowLength)].map((el, i) => {
				return {index: i, rowLength: rowLength}
			});
		}).flat();

		let sliceLeft = sliceInfo[patternPos].index;
		let sliceRight = sliceInfo[patternPos].rowLength - sliceLeft;
		let siblingAspects = imageAspects.slice(imageInd - sliceLeft, imageInd + sliceRight);
		let siblingAspectSum = siblingAspects.reduce((acc, curr) => acc + curr);

		masonaryItem[bpPattern.bp].index = sliceInfo[patternPos].index;// temp
		masonaryItem[bpPattern.bp].rowLength = sliceInfo[patternPos].rowLength;// temp
		masonaryItem[bpPattern.bp].siblingAspectSum = siblingAspectSum;// temp
		masonaryItem[bpPattern.bp].widthRatio = `${imageAspects[imageInd]}/${siblingAspectSum}`;
	});

	return masonaryItem;
});




function validateInput() {
	// TODO - finish
	if (xbreakpoints.length !== xPatterns.length)
		throw `Input Error: Number of patterns (${xPatterns.length}) did not match number of breakpoints (${xbreakpoints.length})`;
}


// debug
masonaryItems.forEach(item => {
	console.log(item);
});




//generateCssRules();
//saveCssFile();


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

