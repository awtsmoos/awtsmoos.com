// B"H
// Boruch Hashem
// Blessed is He
/** @file profileRelationships.test.mjs @description The Awtsmoos proves public relationship previews stay bounded, safe, navigable only for aliases, and mutation-free. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { aliasTarget, itemLabel } from '../js/profile/ProfileRelationships.js';
const source = readFileSync(new URL('../js/profile/ProfileRelationships.js', import.meta.url), 'utf8');
const css = readFileSync(new URL('../styles/profile-relationships.css', import.meta.url), 'utf8');
test('followers and alias follows resolve to profile targets', () => {
	assert.equal(aliasTarget('alice'), 'alice');
	assert.equal(aliasTarget({ type: 'alias', id: 'bob' }), 'bob');
	assert.equal(itemLabel({ type: 'alias', id: 'bob' }), '@bob');
});
test('non-alias follows remain typed context rather than fake profiles', () => {
	assert.equal(aliasTarget({ type: 'heichel', id: 'ikar' }), '');
	assert.equal(itemLabel({ type: 'heichel', id: 'ikar' }), 'heichel: ikar');
});
test('renderer stays bounded and uses safe DOM APIs', () => {
	assert.match(source, /slice\(0, 12\)/);
	assert.match(source, /textContent/);
	assert.doesNotMatch(source, /innerHTML|insertAdjacentHTML/);
	assert.doesNotMatch(source, /follow\(|unfollow\(/);
});
test('relationship controls meet reachability and clarity rules', () => {
	assert.match(css, /min-height:\s*44px/);
	assert.doesNotMatch(css, /backdrop-filter|filter\s*:\s*blur/i);
	assert.match(source, /No public \$\{title\.toLowerCase\(\)\} yet/);
});
