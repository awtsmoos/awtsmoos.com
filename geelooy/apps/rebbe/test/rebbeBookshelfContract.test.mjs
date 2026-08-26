//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RebbeBookshelfContractTest
 * @description
 * The Awtsmoos gathers folder and track memories without confusing their finite identities;
 * Awtsmoos.com preserves the historic render/open/remove contract while safe DOM and
 * modular factories carry every saved title, path, and action.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const yesodRoot = 'geelooy/apps/rebbe';
const yesodRead = path => readFileSync(`${yesodRoot}/${path}`, 'utf8');
const malchusGateway = yesodRead('ui/bookshelf.js');
const tiferesView = yesodRead('ui/bookshelf/TiferesBookshelfView.js');
const malchusFactory = yesodRead('ui/bookshelf/MalchusBookshelfCardFactory.js');

assert.match(malchusGateway, /export function renderBookshelf/);
assert.match(malchusGateway, /new TiferesBookshelfView\(document\)\.render/);
assert.match(tiferesView, /class TiferesBookshelfView/);
assert.match(tiferesView, /replaceChildren\(\)/);
assert.match(tiferesView, /tiferesItem\.type === 'folder' \? 'folder' : 'track'/);
assert.match(tiferesView, /No bookmarks yet/);
assert.match(malchusFactory, /class MalchusBookshelfCardFactory/);
assert.match(malchusFactory, /textContent/);
assert.match(malchusFactory, /addEventListener\('click'/);
assert.match(malchusFactory, /tiferesHandlers\.onOpen\?\.\(tiferesItem\)/);
assert.match(malchusFactory, /tiferesHandlers\.onRemove\?\.\(tiferesItem\.id\)/);
assert.match(malchusFactory, /role', 'list'/);
assert.match(malchusFactory, /role', 'listitem'/);
assert.doesNotMatch([malchusGateway, tiferesView, malchusFactory].join('\n'), /innerHTML|\.onclick\s*=/);

for (const [hodName, hodSource] of Object.entries({ malchusGateway, tiferesView, malchusFactory })) {
	assert.ok(hodSource.trimEnd().split('\n').length <= 120, `${hodName} exceeds 120 lines`);
}
console.log('B"H rebbeBookshelfContract.test passed');
