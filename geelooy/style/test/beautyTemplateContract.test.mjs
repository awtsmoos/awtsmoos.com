// B"H
import fs from 'node:fs';

const files = [
  'geelooy/index.html',
  'geelooy/heichelos/_awtsmoos.heichel.html',
  'geelooy/heichelos/heichel/_awtsmoos.heichel.html',
  'geelooy/heichelos/post/_awtsmoos.post.html'
];

const missingModern = files.filter(file => {
  const text = fs.readFileSync(file, 'utf8');
  return !/beauty-001|legend-001/.test(text);
});
if (missingModern.length) throw new Error('templates are neither beauty nor legend bumped ' + missingModern.join(','));

const home = fs.readFileSync('geelooy/style/social/home/index.css', 'utf8');
if (!home.includes('./beauty/index.css')) throw new Error('home beauty import missing');

const heichel = fs.readFileSync('geelooy/style/heichelos/heichel/index.css', 'utf8');
if (!heichel.includes('./beauty/index.css')) throw new Error('heichel beauty import missing');

const post = fs.readFileSync('geelooy/heichelos/post/styles/main.css', 'utf8');
if (!post.includes('./reader-beauty/index.css')) throw new Error('reader beauty import missing');

console.log('B"H beautyTemplateContract.test passed');
