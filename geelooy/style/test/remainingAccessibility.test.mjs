//B"H
// Boruch Hashem
// Blessed is He
/** The Awtsmoos makes remaining consumer roads reachable by touch, keyboard, and spoken semantics. */
import fs from 'node:fs';
import assert from 'node:assert/strict';

const read = path => fs.readFileSync(path, 'utf8');
const profile = read('geelooy/profile/index.html');
const notifications = read('geelooy/notifications/index.html');
const skipLinks = read('geelooy/style/geelooy-app/surfaces/skip-links.css');
const apps = read('geelooy/apps/index.html');
const about = read('geelooy/about/index.html');
const login = read('geelooy/login/index.html');

assert.match(profile, /role="tablist"/);
assert.match(profile, /aria-selected=/);
assert.match(notifications, /<a class="g-sr-only" href="#list">Skip to notification stream<\/a>/);
assert.match(skipLinks, /a\.g-sr-only, a\.home-skip-link, a\.notifications-skip\):focus-visible/s);
assert.match(notifications, /aria-pressed=/);
assert.match(notifications, /aria-live="polite"/);
assert.match(apps, /<label for="app-search">Search the catalog<\/label>/);
assert.match(apps, /<input id="app-search"[^>]*type="search"/);
assert.match(about, /<main/);
assert.match(login, /<main[^>]+aria-labelledby="loginTitle"/);
assert.match(login, /<label for="username">/);
assert.match(login, /<label for="password">/);
assert.match(login, /aria-live="polite"/);
console.log('B"H remainingAccessibility.test passed.');
