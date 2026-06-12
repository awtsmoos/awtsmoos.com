// B"H
import fs from 'node:fs';
import path from 'node:path';

const roots = [
  'geelooy/style/foundation/beauty',
  'geelooy/style/social/home/beauty',
  'geelooy/style/heichelos/heichel/beauty',
  'geelooy/heichelos/post/styles/reader-beauty'
];

function collectFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true })
    .flatMap(entry => entry.isDirectory()
      ? collectFiles(path.join(dir, entry.name))
      : [path.join(dir, entry.name)]);
}

const bad = roots
  .flatMap(collectFiles)
  .filter(file => file.endsWith('.css'))
  .filter(file => /overflow\s*:\s*hidden|height\s*:\s*100vh/.test(fs.readFileSync(file, 'utf8')));

if (bad.length) {
  throw new Error('beauty global trap risk ' + bad.join(','));
}
console.log('B"H noBeautyGlobalTrap.test passed');
