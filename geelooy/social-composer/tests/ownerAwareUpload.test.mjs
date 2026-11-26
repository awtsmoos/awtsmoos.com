// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module OwnerAwareUploadTests
 * @description Owner-aware upload (2026-11-26): the Heichel page must
 * offer the owner a prominent direct Add (posting as the Heichel's own
 * alias), a non-owner an honest Submit for review, and a signed-out
 * visitor a returning sign-in — and the one composer must arrive with
 * that destination already confirmed, never discarded on show and
 * never left to a picker hunt.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';

const read = p => readFileSync(new URL(p, import.meta.url), 'utf8');

test('heichel hero renders one prominent add action outside the details disclosure', () => {
	const profile = read('../../heichelos/heichel/modules/ui/blueprints/living-path/profile.js');
	assert.match(profile, /id: 'heichelAddAction'/);
	assert.match(profile, /class: 'heichel-add-action'/);
	// The add action is a sibling rendered before the details block,
	// and the buried generic "Create post" link is gone from the row.
	assert.ok(profile.indexOf('addAction()') < profile.indexOf('details(actions)'));
	assert.doesNotMatch(profile, /link\(composerHref, 'Create post'/);
});

test('add-action resolver speaks the three honest states from verified sources', () => {
	const resolver = read('../../heichelos/heichel/modules/living-path/add-action.js');
	// Identity + destination access are the composer's own endpoints.
	assert.match(resolver, /unified-social\/identity/);
	assert.match(resolver, /unified-social\/destinations\//);
	// The Heichel's owner alias wins over the account's selected alias.
	assert.match(resolver, /ownerAlias/);
	assert.match(resolver, /aliases\.some\(alias => alias\.aliasId === ownerAlias\)/);
	// Owner, contributor, and sign-in states, each with its own label.
	assert.match(resolver, /state: 'owner'/);
	assert.match(resolver, /state: 'contributor'/);
	assert.match(resolver, /label: 'Submit for review'/);
	assert.match(resolver, /state: 'signin'/);
	assert.match(resolver, /\/login\/\?return=/);
	// The composer href names the posting alias explicitly.
	assert.match(resolver, /parameters\.set\('alias', aliasId\)/);
	// Older server builds without ownerAlias fall back to the
	// legacy ownership oracle instead of guessing.
	assert.match(resolver, /probeOwnerAlias/);
	assert.match(resolver, /\/ownership`/);
});

test('owner series controls go to the one composer, not the legacy submit page', () => {
	const controls = read('../../heichelos/heichel/modules/ui/render/governance/create-controls.js');
	assert.match(controls, /window\.location\.href = `\/social-composer\/\?\$\{parameters\}`/);
	assert.doesNotMatch(controls, /submit\?parentSeriesId/);
});

test('quick composer auto-confirms a deep-linked destination per verified alias', () => {
	const destination = read('../js/quick/destination.js');
	assert.match(destination, /async function applyHint\(\)/);
	assert.match(destination, /hintAttemptedFor===alias/);
	assert.match(destination, /exactDetail\(detail,target\.h,target\.s\)/);
	assert.match(destination, /composer\.state\.selectDestination\(detail\)/);
	// Alias changes re-run the hint for the new alias (owner switch).
	assert.match(destination, /void applyHint\(\);\n\t\}/);
});

test('quick layout never discards a deep-linked destination on show', () => {
	const layout = read('../js/civilization/quickPostLayout.js');
	assert.match(layout, /if\(!context\.heichelId\) \{destination\.clear\(\);state\.selectDestination\(null\);}/);
});

test('add action is styled in the living-path profile module, gold for owner and sign-in', () => {
	const css = read('../../style/heichelos/heichel/cosmic-profile/mobile-series/living-path/profile.css');
	assert.match(css, /\.heichel-add-action \{/);
	assert.match(css, /linear-gradient\(180deg, #e8c268, #b98a2e\)/);
	assert.match(css, /\.heichel-add-action\[data-state="contributor"\]/);
});
