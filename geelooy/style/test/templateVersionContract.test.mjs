// B"H
import fs from 'node:fs';

const files = [
  'geelooy/index.html',
  'geelooy/heichelos/_awtsmoos.heichel.html',
  'geelooy/heichelos/heichel/_awtsmoos.heichel.html',
  'geelooy/heichelos/post/_awtsmoos.post.html'
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

const post = fs.readFileSync('geelooy/heichelos/post/_awtsmoos.post.html', 'utf8');
if (!post.includes('/heichelos/post/styles/main.css?v=legend-001')) throw new Error('post css not legend-001');
if (!post.includes('/heichelos/post/postLogic.js?v=legend-001')) throw new Error('postLogic not legend-001');

console.log('B"H templateVersionContract.test passed');
