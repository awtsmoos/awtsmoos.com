//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Current route beauty/template ownership witness.
 * @description
 * The Awtsmoos does not require one generation word across unlike vessels; Awtsmoos.com proves each route owns the correct current style architecture while shared beauty remains imported where that route uses it.
 */
import fs from 'node:fs';
import assert from 'node:assert/strict';

const homeTemplate = fs.readFileSync('geelooy/index.html', 'utf8');
const heichelDirectory = fs.readFileSync('geelooy/heichelos/_awtsmoos.heichel.html', 'utf8');
const heichelDetail = fs.readFileSync('geelooy/heichelos/heichel/_awtsmoos.heichel.html', 'utf8');
const postTemplate = fs.readFileSync('geelooy/heichelos/post/_awtsmoos.post.html', 'utf8');

assert.match(homeTemplate, /\/style\/home-simple\/base\.css\?v=main-brand-001/);
assert.match(homeTemplate, /\/style\/home-simple\/components\.css\?v=main-brand-002/);
assert.match(heichelDirectory, /\/style\/heichelos\/heichel\/index\.css\?v=cosmic-profile-002/);
assert.match(heichelDetail, /\/style\/heichelos\/heichel\/index\.css\?v=ikar-vision-001/);
assert.match(postTemplate, /\/heichelos\/post\/styles\/main\.css\?v=reader-chitas-007/);

const homeBase = fs.readFileSync('geelooy/style/home-simple/base.css', 'utf8');
assert.match(homeBase, /revelation-v4\/index\.css/);

const heichel = fs.readFileSync('geelooy/style/heichelos/heichel/index.css', 'utf8');
assert.match(heichel, /\.\/beauty\/index\.css/);

const post = fs.readFileSync('geelooy/heichelos/post/styles/main.css', 'utf8');
assert.match(post, /\.\/reader-beauty\/index\.css/);

console.log('B"H beautyTemplateContract.test passed for current route-owned beauty architecture.');
