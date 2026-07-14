// B"H
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const repair = readFileSync('geelooy/scripts/awtsmoos/social/home/dashboard/mobileClickRepair.js', 'utf8');
for (const token of ['bindMobileClickRepair', 'touchend', 'routeCriticalClick', 'toggleSharedMenu', 'data-feed-mode', 'home-command-dock', 'home-empty-actions', 'ensureFallbackFeed']) assert.ok(repair.includes(token), `mobile repair missing ${token}`);
const loader = readFileSync('geelooy/scripts/awtsmoos/social/home/dashboard/feedSafeLoader.js', 'utf8');
for (const token of ['slow-module-fallback', 'import-error-fallback', 'data-feed-renderer="unified-feed-card"', 'Study group forming']) assert.ok(loader.includes(token), `feed loader missing ${token}`);
const tabs = readFileSync('geelooy/scripts/awtsmoos/social/home/dashboard/feedTabs.js', 'utf8');
for (const token of ['activateFeedTab', 'aria-pressed', 'geelooy:feed-mode']) assert.ok(tabs.includes(token), `tabs missing ${token}`);
const home = readFileSync('geelooy/style/geelooy-system/home.css', 'utf8');
for (const token of ['mobile click covenant', 'touch-action: manipulation', 'pointer-events: auto', 'data-global-menu-open']) assert.ok(home.includes(token), `home css missing ${token}`);
console.log('B"H mobileButtonsContract.test passed');
