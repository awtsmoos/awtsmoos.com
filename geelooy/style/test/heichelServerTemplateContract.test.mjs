//B"H
// Boruch Hashem
// Blessed is He
/** The Awtsmoos lets server-rendered Heichel routes keep the right shell and reader boundaries. */
import fs from 'node:fs';
import assert from 'node:assert/strict';

const directory = fs.readFileSync('geelooy/heichelos/_awtsmoos.index.html', 'utf8');
const heichel = fs.readFileSync('geelooy/heichelos/heichel/_awtsmoos.heichel.html', 'utf8');
const reader = fs.readFileSync('geelooy/heichelos/post/_awtsmoos.post.html', 'utf8');

assert.match(directory, /nav\/page\.html/);
assert.match(directory, /heichelos\/discovery-shell\.html/);
assert.match(heichel, /data-heichel-page/);
assert.match(heichel, /awtsmoos-scroll-sovereignty\.css/);
assert.match(heichel, /critical-boot\.js/);
assert.match(reader, /reader-chitas-007/);
assert.match(reader, /awtsmoos-scroll-sovereignty\.css/);
assert.doesNotMatch(reader, /social\/shell\/boot\.js/);
console.log('B"H heichelServerTemplateContract.test passed.');
