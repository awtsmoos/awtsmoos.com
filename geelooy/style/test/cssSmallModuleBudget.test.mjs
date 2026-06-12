// B"H
import fs from 'node:fs';
import path from 'node:path';

const roots = [
  'geelooy/style/foundation',
  'geelooy/style/social/home',
  'geelooy/style/heichelos/heichel',
  'geelooy/heichelos/post/styles/reader-foundation',
  'geelooy/heichelos/post/styles/reader-content',
  'geelooy/heichelos/post/styles/reader-controls',
  'geelooy/heichelos/post/styles/reader-settings',
  'geelooy/heichelos/post/styles/reader-sidebar',
  'geelooy/heichelos/post/styles/reader-overlays',
  'geelooy/heichelos/post/styles/reader-responsive'
];
const exempt = new Set(['index.css']);

function collectFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true })
    .flatMap(entry => entry.isDirectory()
      ? collectFiles(path.join(dir, entry.name))
      : [path.join(dir, entry.name)]);
}

const offenders = roots
  .flatMap(collectFiles)
  .filter(file => file.endsWith('.css'))
  .filter(file => !exempt.has(path.basename(file)))
  .map(file => [file, fs.readFileSync(file, 'utf8').split(/\r?\n/).length])
  .filter(([, count]) => count > 120);

if (offenders.length) {
  throw new Error('large css modules ' + JSON.stringify(offenders));
}
console.log('B"H cssSmallModuleBudget.test passed');
