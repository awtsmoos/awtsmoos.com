// B"H
import fs from 'node:fs';

const files = [
  'geelooy/index.html',
  'geelooy/heichelos/_awtsmoos.heichel.html',
  'geelooy/heichelos/heichel/_awtsmoos.heichel.html',
  'geelooy/heichelos/post/_awtsmoos.post.html',
  'geelooy/heichelos/_awtsmoos.post.html'
];

const stale = [];
for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  if (/visual-303|modal-scroll-299|eager-verses-299|beauty-001/.test(text)) stale.push(file);
}
if (stale.length) throw new Error('stale template cache versions: ' + stale.join(', '));

const home = fs.readFileSync('geelooy/index.html', 'utf8');
if (!home.includes('/style/social/home/index.css?v=legend-001')) throw new Error('home does not use legend home entry');
if (!home.includes('/scripts/awtsmoos/social/home/legend/index.js?v=legend-001')) throw new Error('home legend script missing');

for (const file of ['geelooy/heichelos/post/_awtsmoos.post.html', 'geelooy/heichelos/_awtsmoos.post.html']) {
  const post = fs.readFileSync(file, 'utf8');
  if (!post.includes('/heichelos/post/styles/main.css?v=legend-002')) throw new Error(file + ' post css not legend-002');
  if (!post.includes('/heichelos/post/styles/reader-controls/live-template.css?v=legend-002')) throw new Error(file + ' live template css missing');
  if (!post.includes('awtsmoos-reader-critical-css')) throw new Error(file + ' critical reader css missing');
  if (!post.includes('/heichelos/post/postLogic.js?v=legend-002')) throw new Error(file + ' postLogic not legend-002');
}

console.log('B"H templateVersionContract.test passed');
