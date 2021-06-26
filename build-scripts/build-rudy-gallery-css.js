import fs from 'fs';
import sizeOf from 'image-size';


/* 
 * Config 
 *
 * List image urls below in source order .
 * Tempting to read from dir but that would mean fixed order.
 */
const imageUrls = [
	"./site/images/rudy-full-res/rudy (1).jpg",
	"./site/images/rudy-full-res/rudy (2).jpg",
	"./site/images/rudy-full-res/rudy (3).jpg",
	"./site/images/rudy-full-res/rudy (4).jpg",
	"./site/images/rudy-full-res/rudy (5).jpg",
	"./site/images/rudy-full-res/rudy (6).jpg",
	"./site/images/rudy-full-res/rudy (7).jpg",
	"./site/images/rudy-full-res/rudy (8).jpg",
	"./site/images/rudy-full-res/rudy (9).jpg",
	"./site/images/rudy-full-res/rudy (10).jpg",
	"./site/images/rudy-full-res/rudy (11).jpg",
	"./site/images/rudy-full-res/rudy (12).jpg",
	"./site/images/rudy-full-res/rudy (13).jpg",
	"./site/images/rudy-full-res/rudy (14).jpg",
	"./site/images/rudy-full-res/rudy (15).jpg",
	"./site/images/rudy-full-res/rudy (16).jpg",
	"./site/images/rudy-full-res/rudy (17).jpg",
	"./site/images/rudy-full-res/rudy (18).jpg",
	"./site/images/rudy-full-res/rudy (19).jpg",
	"./site/images/rudy-full-res/rudy (20).jpg",
	"./site/images/rudy-full-res/rudy (21).jpg",
	"./site/images/rudy-full-res/rudy (22).jpg",
	"./site/images/rudy-full-res/rudy (23).jpg",
	"./site/images/rudy-full-res/rudy (24).jpg",
	"./site/images/rudy-full-res/rudy (25).jpg",
	"./site/images/rudy-full-res/rudy (26).jpg",
	"./site/images/rudy-full-res/rudy (27).jpg",
	"./site/images/rudy-full-res/rudy (28).jpg",
	"./site/images/rudy-full-res/rudy (29).jpg",
	"./site/images/rudy-full-res/rudy (30).jpg",
	"./site/images/rudy-full-res/rudy (31).jpg",
	"./site/images/rudy-full-res/rudy (32).jpg",
	"./site/images/rudy-full-res/rudy (33).jpg",
	"./site/images/rudy-full-res/rudy (34).jpg",
	"./site/images/rudy-full-res/rudy (35).jpg",
	"./site/images/rudy-full-res/rudy (36).jpg",
	"./site/images/rudy-full-res/rudy (37).jpg",
	"./site/images/rudy-full-res/rudy (38).jpg",
]
const itemCustomPropertyName = "rudyCard";
const itemCssClass = "rudy-cards__card";
const cssGutterWidthVarName = '--gutter';
const cssBorderWidthVarName = '--borderWidth';
const cssPaddingWidthVarName = '--paddingWidth';
const outputPath = "./site/generated/built-rudy-gallery.css";
const breakpoints = [340, 600, 980];
const patterns = [
	[2, 1],
	[3, 2],
	[4, 3, 2, 3]
];


/* Vars */
const imageAspects = imageUrls.map(url => {
	const { width, height } = sizeOf(url);
	return width / height;
});
const patternLengths = patterns.map( pattern => pattern.reduce((acc, curr) => acc + curr) );


/* Run everything */
validateInput();
const masonaryItems = getMasonaryItemsData();
if ( fs.existsSync(outputPath) )
	fs.unlinkSync(outputPath);
writeCssCustomPropertiesToFile();
writeMediaQueriesToFile();


// debug
masonaryItems.forEach(item => {
	console.log(item);
});


/*
 *
 */
function validateInput() {
	// TODO - add more validation
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
	fs.appendFileSync(outputPath, `:root {\n`);

	breakpoints.forEach((breakpoint, i) => {
		masonaryItems.forEach((masonaryItem, ii)  => {
			let fractionOfRow = `${masonaryItem.breakpoints[i].fractionOfRow}`;
			let gutterSpace = `${masonaryItem.breakpoints[i].nGutters} * var(${cssGutterWidthVarName})`;
			let borderSpace = `${masonaryItem.breakpoints[i].nBorders} * var(${cssBorderWidthVarName})`;
			let paddingSpace = `${masonaryItem.breakpoints[i].nBorders} * var(${cssPaddingWidthVarName})`;
			let totalSpace = `( (${gutterSpace}) + (${borderSpace}) + (${paddingSpace}) )`;
			let customPropWidthName = `${itemCustomPropertyName}${ii+1}-bp${breakpoint}-width`;
			let customPropWidthVal = `calc( (100% - ${totalSpace}*1px) * ${fractionOfRow} )`;

			masonaryItem.breakpoints[i].customPropWidthName = customPropWidthName;
			fs.appendFileSync(outputPath, `\t--${customPropWidthName}: ${customPropWidthVal};\n`);
		});
		fs.appendFileSync(outputPath, `\n`);
	});

	fs.appendFileSync(outputPath, `}`);
	fs.appendFileSync(outputPath, `\n\n`);
}


/*
 * Generates media queries and writes to file.
 */
function writeMediaQueriesToFile() {
	breakpoints.forEach((breakpoint, i) => {
		fs.appendFileSync(outputPath, `@media screen and (min-width: ${breakpoint}px) {\n`);

		masonaryItems.forEach((masonaryItem, ii) => {
			fs.appendFileSync(outputPath,
				`\t.${itemCssClass}:nth-of-type(${ii+1}) {` + 
				` width: var(--${masonaryItem.breakpoints[i].customPropWidthName}); ` +
				`}\n`
			);
		});

		fs.appendFileSync(outputPath, `}\n`);
	});
}

