const fs = require('fs');
const nunjucks = require('nunjucks');


const imagesMetaPath = './dist/data/imagesMeta.json';
const imagesMetaJSON = fs.readFileSync(imagesMetaPath);
const imagesMeta = JSON.parse(imagesMetaJSON);

const indexContext = {
  imagesMeta: imagesMeta
};

nunjucks.configure('src/templates/views', {});


/* Index */
const indexHtml = nunjucks.render('index.njk', indexContext);
const indexHtmlDestPath = './dist/index.html';
fs.writeFile(indexHtmlDestPath, indexHtml, err => {
  if (err) throw err;
  console.log(`${indexHtmlDestPath} saved..`)
});