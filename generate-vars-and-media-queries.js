const path = require('path');
const fs = require('fs');
const sizeOf = require('image-size');


/* 
 * Config 
 */
/* List image urls below in source order */
const imageUrls = [
	"./images/rudy-raw-named/rudy (1).jpg",
	"./images/rudy-raw-named/rudy (2).jpg",
	"./images/rudy-raw-named/rudy (3).jpg",
	"./images/rudy-raw-named/rudy (4).jpg",
	"./images/rudy-raw-named/rudy (5).jpg",
	"./images/rudy-raw-named/rudy (6).jpg",
	"./images/rudy-raw-named/rudy (7).jpg",
	"./images/rudy-raw-named/rudy (8).jpg",
	"./images/rudy-raw-named/rudy (9).jpg",
	"./images/rudy-raw-named/rudy (10).jpg",
	"./images/rudy-raw-named/rudy (11).jpg",
	"./images/rudy-raw-named/rudy (12).jpg",
	"./images/rudy-raw-named/rudy (13).jpg",
	"./images/rudy-raw-named/rudy (14).jpg",
	"./images/rudy-raw-named/rudy (15).jpg",
	"./images/rudy-raw-named/rudy (16).jpg",
	"./images/rudy-raw-named/rudy (17).jpg",
	"./images/rudy-raw-named/rudy (18).jpg",
	"./images/rudy-raw-named/rudy (19).jpg",
	"./images/rudy-raw-named/rudy (20).jpg",
	"./images/rudy-raw-named/rudy (21).jpg",
	"./images/rudy-raw-named/rudy (22).jpg",
	"./images/rudy-raw-named/rudy (23).jpg",
	"./images/rudy-raw-named/rudy (24).jpg",
	"./images/rudy-raw-named/rudy (25).jpg",
	"./images/rudy-raw-named/rudy (26).jpg",
	"./images/rudy-raw-named/rudy (27).jpg",
	"./images/rudy-raw-named/rudy (28).jpg",
	"./images/rudy-raw-named/rudy (29).jpg",
	"./images/rudy-raw-named/rudy (30).jpg",
	"./images/rudy-raw-named/rudy (31).jpg",
	"./images/rudy-raw-named/rudy (32).jpg",
	"./images/rudy-raw-named/rudy (33).jpg",
	"./images/rudy-raw-named/rudy (34).jpg",
	"./images/rudy-raw-named/rudy (35).jpg",
	"./images/rudy-raw-named/rudy (36).jpg",
	"./images/rudy-raw-named/rudy (37).jpg",
	"./images/rudy-raw-named/rudy (38).jpg",
]
const itemCustomPropertyName = "rudyCard";
const itemCssClass = "card";
const cssGutterWidthVarName = '--gutter';
const cssBorderWidthVarName = '--borderWidth';
const cssPaddingWidthVarName = '--paddingWidth';
const outputPath = path.join(__dirname, "styles/generated-vars-and-media-queries.css");
const breakpoints = [400, 768, 992, 1200];
const patterns = [
	[2, 1],
	[3, 2],
	[4, 3, 2, 3],
	[5, 4, 3, 4]
];


/* Vars */
const imageAspects = imageUrls.map(url => {
	const { width, height } = sizeOf(url);
	return width / height;
});
const patternLengths = patterns.map( pattern => pattern.reduce((acc, curr) => acc + curr) );


/*  */
validateInput();
const masonaryItems = getMasonaryItemsData();
if ( fs.existsSync(outputPath) )
	fs.unlinkSync(outputPath);
writeCssCustomPropertiesToFile();
writeMediaQueriesToFile()


/* Debug */
masonaryItems.forEach(item => {
	console.log(item);
});


/* NEXT: work out how to name all the custom properties, --itemCustomPropertyNameX-bpXXX
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
 * Calculate data for each masonary item needed to work out it's width
 */
function getMasonaryItemsData() {
	return imageUrls.map((imageUrl, imageInd) => {
		const masonaryItem = {
			index: imageInd,// temp
			url: imageUrl,// temp
			aspect: imageAspects[imageInd],// temp
			breakpoints: []
		};
	
		patterns.forEach((pattern, iPattern) => {
			const breakpointData = {};
			const patternPos = imageInd % patternLengths[iPattern];
	
			const sliceInfo = pattern.map(rowLength => {
				return [...new Array(rowLength)].map((el, i) => {
					return {index: i, rowLength: rowLength}
				});
			}).flat();

			let sliceLeft = sliceInfo[patternPos].index;
			let sliceRight = sliceInfo[patternPos].rowLength - sliceLeft;

			let deficit = 0;
			while( imageInd + sliceRight - deficit > imageAspects.length)
				deficit+=1;
			
			const siblingAspects = imageAspects.slice(imageInd - sliceLeft, imageInd + sliceRight - deficit);
			const siblingAspectSum = siblingAspects.reduce((acc, curr) => acc + curr);
			const nGutters = sliceInfo[patternPos].rowLength - deficit - 1;
			const nBorders = (sliceInfo[patternPos].rowLength - deficit) * 2;

			breakpointData.width = breakpoints[iPattern];
			breakpointData.index = sliceInfo[patternPos].index;
			breakpointData.rowLength = sliceInfo[patternPos].rowLength;
			breakpointData.fractionOfRow = `${imageAspects[imageInd]}/${siblingAspectSum}`;
			breakpointData.nGutters = nGutters;
			breakpointData.nBorders = nBorders;
			breakpointData.deficit = deficit;
			masonaryItem.breakpoints.push(breakpointData);
		});
	
		return masonaryItem;
	});
}


/*
 * Generates and writes css custom properties to file for each masonary item at each breakpoint
 */
function writeCssCustomPropertiesToFile() {
	fs.appendFileSync(outputPath, ':root {\n');

	masonaryItems.forEach(masonaryItem => {
		masonaryItem.breakpoints.forEach(breakpoint => {
			fs.appendFileSync(outputPath, `\t--${itemCustomPropertyName}${masonaryItem.index+1}-bp${breakpoint.width}: ${breakpoint.fractionOfRow};\n`);
		});
	});

	fs.appendFileSync(outputPath, '}');
	fs.appendFileSync(outputPath, '\n\n');
}


/*
 * Generates media queries and writes to file.
 */
function writeMediaQueriesToFile() {
	breakpoints.forEach((breakpoint, bpIndex) => {
		fs.appendFileSync(outputPath, `@media screen and (min-width: ${breakpoint}px) {\n`);

		masonaryItems.forEach(masonaryItem => {
			let iterator = masonaryItem.index+1;
			let width = masonaryItem.breakpoints[bpIndex].width;
			let cssVar = `${itemCustomPropertyName}${iterator}-bp${width}`;
			let gutterSpace = `${masonaryItem.breakpoints[bpIndex].nGutters} * var(${cssGutterWidthVarName})`;
			let borderSpace = `${masonaryItem.breakpoints[bpIndex].nBorders} * var(${cssBorderWidthVarName})`;
			let paddingSpace = `${masonaryItem.breakpoints[bpIndex].nBorders} * var(${cssPaddingWidthVarName})`;

			fs.appendFileSync(outputPath,
				`\t.${itemCssClass}:nth-of-type(${iterator}) {` + 
				` width: calc( (100% - (${gutterSpace}*1px) - (${borderSpace}*1px) - (${paddingSpace}*1px)) * var(--${cssVar}) ); ` + 
				`}\n`);
		});

		fs.appendFileSync(outputPath, `}\n`);
	});
}



