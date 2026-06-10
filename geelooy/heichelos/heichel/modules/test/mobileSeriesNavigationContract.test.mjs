// B"H
/**
 * Chapter 91: mobile series navigation page contract.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const layout = readFileSync('geelooy/heichelos/heichel/modules/ui/blueprints/main-layout.js', 'utf8');
const grids = readFileSync('geelooy/heichelos/heichel/modules/ui/render/grids.js', 'utf8');
const cardData = readFileSync('geelooy/heichelos/heichel/modules/ui/render/cardData.js', 'utf8');
const html = readFileSync('geelooy/heichelos/_awtsmoos.heichel.html', 'utf8');

for (const token of ['heichel-mobile-topbar', 'geelooy-heichel-hero', 'hero-stats', 'series-heading', 'series-search-row', 'geelooy-bottom-nav']) assert.ok(layout.includes(token), `layout missing ${token}`);
for (const token of ['nav-card-media', 'nav-card-title-row', 'nav-card-chevron', 'Bookmark', 'Show Comments']) assert.ok(grids.includes(token), `grids missing ${token}`);
for (const token of ['normalizeCardData', 'postCount', 'followersCount', 'sectionsCount', 'commentsCount', 'matchesQuery']) assert.ok(cardData.includes(token), `cardData missing ${token}`);
assert.ok(html.includes('/style/heichelos/heichel/index.css'), 'heichel html must load split css');
console.log('B"H mobileSeriesNavigationContract.test passed');
