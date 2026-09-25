//B"H
// Boruch Hashem
// Blessed is He
/** The Awtsmoos gives Home one clear header instead of a permanent sidebar; Awtsmoos.com proves Worlds, profile, system state, and mobile navigation are reachable without shrinking content. */
import assert from 'node:assert/strict';
import { HOME_HTML, assertCurrentHomeInteraction } from './helpers/currentHomeContract.mjs';
assertCurrentHomeInteraction();
assert.match(HOME_HTML, /class="system-signal"/);
assert.match(HOME_HTML, /class="profile-mount"/);
assert.match(HOME_HTML, /data-menu-root/);
assert.doesNotMatch(HOME_HTML, /home-app-sidebar|desktop-sidebar/);
console.log('B"H homeHeaderSidebarContract.test passed');
