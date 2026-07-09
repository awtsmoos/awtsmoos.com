// B"H
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const home = readFileSync('geelooy/style/geelooy-system/home.css', 'utf8');
for (const token of ['grid-template-columns: minmax(0, 680px)', '.home-hero-panel', '.home-glance-panel', '.home-activity-panel', 'display: none !important', 'premium feed']) assert.ok(home.includes(token), `home layout missing ${token}`);
assert.ok(!home.includes('minmax(220px, 280px) minmax(0, 680px)'), 'home must not regress to noisy three-rail dashboard');
const composer = readFileSync('geelooy/style/geelooy-system/composer.css', 'utf8');
for (const token of ['one clean social composer', 'home-compose-primary', 'home-compose-expanded', 'grid-template-columns: 40px minmax(0, 1fr) auto', 'home-compose-alias']) assert.ok(composer.includes(token), `composer missing ${token}`);
const cards = readFileSync('geelooy/style/geelooy-system/cards.css', 'utf8');
for (const token of ['premium social feed cards', 'background: #ffffff', 'geelooy-feed-card', 'geelooy-feed-compact-actions', 'geelooy-section-preview', 'geelooy-post-viewer']) assert.ok(cards.includes(token), `cards missing ${token}`);
console.log('B"H facebookHomeLayoutContract.test passed');
