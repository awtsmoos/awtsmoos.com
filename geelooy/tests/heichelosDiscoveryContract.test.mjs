//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file heichelosDiscoveryContract.test.mjs
 * @description Guards Torah-first discovery across controller, real head, body shell, and responsive vessels.
 * The Awtsmoos is one while each layer keeps its task; Awtsmoos.com tests present ownership instead of fossilized markup.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const controller = readFileSync(resolve(root, 'geelooy/heichelos/_awtsmoos.index.html'), 'utf8');
const shell = readFileSync(resolve(root, 'templates/heichelos/discovery-shell.html'), 'utf8');
const head = readFileSync(resolve(root, 'templates/heichelos/discovery-head.html'), 'utf8');
const layoutCss = readFileSync(resolve(root, 'geelooy/style/heichelos/discovery-layout.css'), 'utf8');
const cardCss = readFileSync(resolve(root, 'geelooy/style/heichelos/discovery-cards.css'), 'utf8');
const responsiveCss = readFileSync(resolve(root, 'geelooy/style/heichelos/discovery-responsive.css'), 'utf8');

assert.match(controller, /B(?:oruch)? Hashem/i);
assert.match(controller, /\/api\/social\/heichelos\/discover\?limit=100/);
assert.match(controller, /\$a\('heichelos\/discovery-shell\.html'/);
assert.match(controller, /\$a\('heichelos\/discovery-results\.html'/);
assert.match(controller, /\$a\('heichelos\/discovery-head\.html'/);
assert.doesNotMatch(controller, /viewer-box/);

assert.match(shell, /<h1\b[^>]*>/i);
assert.match(shell, /role="search"/);
assert.doesNotMatch(shell, /rel="stylesheet"/);
assert.match(head, /\/style\/geelooy-app\/index\.css/);
assert.match(head, /\/style\/social-system\/index\.css/);
assert.match(head, /\/style\/heichelos\/discovery\.css/);
assert.match(head, /name="robots" content="index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1"/);
assert.match(head, /rel="canonical" href="https:\/\/awtsmoos\.com\/heichelos\/"/);
assert.match(head, /name="twitter:card" content="summary"/);
assert.match(head, /data-awtsmoos-heichelos-jsonld/);
assert.match(head, /"@type":"CollectionPage"/);

assert.match(layoutCss, /\.social-spaces-shell/);
assert.match(layoutCss, /\.spaces-search/);
assert.match(layoutCss, /max-height:\s*min\(66dvh,\s*54rem\)/);
assert.match(layoutCss, /overflow:\s*auto/);
assert.match(cardCss, /\.social-space-card/);
assert.match(cardCss, /\.space-actions/);
assert.match(responsiveCss, /max-width:\s*47\.5rem/);
assert.match(responsiveCss, /max-width:\s*30rem/);

console.log('B"H Heichelos discovery contract passed.');
