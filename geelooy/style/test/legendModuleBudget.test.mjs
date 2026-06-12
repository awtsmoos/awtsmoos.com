// B"H
import fs from 'node:fs';
import path from 'node:path';

const roots = [
  'geelooy/style/foundation/legend',
  'geelooy/style/social/home/legend',
  'geelooy/style/heichelos/heichel/legend',
  'geelooy/heichelos/post/styles/reader-legend'
];

function collectFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true })
    .flatMap(entry => entry.isDirectory()
      ? collectFiles(path.join(dir, entry.name))
      : [path.join(dir, entry.name)]);
}

const offenders = roots
  .flatMap(collectFiles)
  .filter(file => file.endsWith('.css'))
  .filter(file => path.basename(file) !== 'index.css')
  .map(file => [file, fs.readFileSync(file, 'utf8').split(/\r?\n/).length])
  .filter(([, lines]) => lines > 120);

if (offenders.length) {
  throw new Error('large legend modules ' + JSON.stringify(offenders));
}
console.log('B"H legendModuleBudget.test passed');
