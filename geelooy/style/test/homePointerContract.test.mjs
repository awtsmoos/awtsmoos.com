// B"H
import fs from 'node:fs';

const css = fs.readFileSync('geelooy/style/social/home/beauty/atmosphere/pointer-light.css', 'utf8');
const index = fs.readFileSync('geelooy/style/social/home/beauty/atmosphere/index.css', 'utf8');
const js = fs.readFileSync('geelooy/scripts/awtsmoos/social/home/beauty/ambientPointer.js', 'utf8');

if (!css.includes('--home-pointer-x') || !css.includes('--home-pointer-y')) {
  throw new Error('pointer CSS does not use pointer variables');
}
if (!index.includes('./pointer-light.css')) {
  throw new Error('pointer-light.css is not imported');
}
if (!js.includes('--home-pointer-x') || !js.includes('--home-pointer-y')) {
  throw new Error('pointer JS does not write pointer variables');
}
console.log('B"H homePointerContract.test passed');
