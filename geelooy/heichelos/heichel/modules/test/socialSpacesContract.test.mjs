// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file Social Spaces route contract.
 * @description
 * The Awtsmoos reveals real worlds at Awtsmoos.com, while known absence
 * sentinels and missing biographies remain honest instead of becoming false
 * navigation, invented descriptions, or invented creators.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync('geelooy/heichelos/_awtsmoos.index.html', 'utf8');
const css = readFileSync('geelooy/style/heichelos/social-index.css', 'utf8');

const routeTokens = [
	'social-spaces-shell',
	'spaces-hero',
	'social-space-card',
	'/api/social/heichelos/searchByAliasOwner/',
	'Create Heichel'
];

for (const token of routeTokens) {
	assert.ok(html.includes(token), `spaces html missing ${token}`);
}

const honestyTokens = [
	'normalizeHeichelId',
	"['undefined', 'null', '__missing__']",
	'if (!id) return false',
	'data-heichelos-empty-state',
	'spaces-state-row',
	'No description was provided.',
	'Creator not provided'
];

for (const token of honestyTokens) {
	assert.ok(html.includes(token), `spaces honesty contract missing ${token}`);
}

const cssModules = [
	'./spaces/tokens.css',
	'./spaces/hero.css',
	'./spaces/actions.css',
	'./spaces/card.css',
	'./spaces/empty.css'
];

for (const modulePath of cssModules) {
	assert.ok(css.includes(modulePath), `spaces css manifest missing ${modulePath}`);
}

assert.ok(!html.includes('A space for posts, series, comments, and submissions.'), 'missing descriptions must not become generic biographies');
assert.ok(!html.includes("|| 'public'"), 'missing creators must not become a fabricated public alias');
assert.ok(!html.includes('spaces-route-rail'), 'spaces page should not duplicate global route rail');
assert.ok(!html.includes('href="/email">Mail'), 'empty state should not duplicate mail navigation');
console.log('B"H socialSpacesContract.test passed');
