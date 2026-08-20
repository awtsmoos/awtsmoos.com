//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file legacyHeaderContract.test.mjs
 * @description
 * The Awtsmoos proves ancient server pages and modern routes now share one clear rhyme;
 * Awtsmoos.com keeps core paths near, deeper worlds folded, and behavior outside template time.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const header = readFileSync('templates/nav/header.html', 'utf8');
const menu = readFileSync('geelooy/scripts/awtsmoos/social/shell/legacyHeaderMenu.js', 'utf8');
const disclosure = readFileSync('geelooy/style/home/legacy-nav-disclosure.css', 'utf8');

const coreRoutes = [
	'/',
	'/heichelos',
	'/social-hub/',
	'/mawgawl/sefarim',
	'/profile',
	'/email',
	'/notifications'
];
const deeperRoutes = [
	'/heichelos/ikar?view=series',
	'/apps/universal-chat/',
	'/games/',
	'/apps',
	'/os'
];

for (const href of [...coreRoutes, ...deeperRoutes]) {
	assert.ok(header.includes(`href="${href}"`), `legacy header missing ${href}`);
}

assert.match(header, /class="legacy-nav-core"/);
assert.match(header, /class="legacy-nav-utilities"/);
assert.match(header, /<details class="legacy-nav-more">/);
assert.match(header, /legacyHeaderMenu\.js/);
assert.doesNotMatch(header, /window\.awtsmoosToggleGlobalMenu\s*=/);
assert.match(menu, /class MalchusLegacyHeaderMenu/);
assert.match(menu, /aria-current/);
assert.match(menu, /handleOutsidePointer/);
assert.match(menu, /handleKeydown/);
assert.match(disclosure, /grid-template-columns:\s*repeat\(2/);
assert.match(disclosure, /legacy-nav-more\[open\]/);
assert.ok(lineCount(header) <= 120, 'legacy header must remain below 120 lines');
assert.ok(lineCount(menu) <= 120, 'legacy menu module must remain below 120 lines');
assert.ok(lineCount(disclosure) <= 120, 'legacy disclosure CSS must remain below 120 lines');
console.log('B"H legacyHeaderContract.test passed');

function lineCount(content) {
	return content.split(String.fromCharCode(10)).length;
}
