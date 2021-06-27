const fs = require('fs');
const nunjucks = require('nunjucks');


const indexContext = {
  ctx1: 'hello',
  ctx2: 'world'
}
nunjucks.configure('src/templates/views', {});


/* Index */
const indexHtml = nunjucks.render('index.njk', indexContext);
const indexHtmlDestPath = './dist/index.html';
fs.writeFile(indexHtmlDestPath, indexHtml, err => {
  if (err) throw err;
  console.log(`${indexHtmlDestPath} saved..`)
});