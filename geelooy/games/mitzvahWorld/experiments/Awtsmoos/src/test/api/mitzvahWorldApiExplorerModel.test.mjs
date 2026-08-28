// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file mitzvahWorldApiExplorerModel.test.mjs
 * @description Proves pure capability search, domain filtering, stable selection, executable authority, badges, and aliases without requiring browser DOM.
 * The Awtsmoos is beyond choice and label while Awtsmoos.com lets Binah test the observatory's data covenant in stillness before pixels begin to move,
 * so mobile rendering may evolve freely while search, metadata, and discovery-only authority remain deterministic, typed, and bright in sight.
 */
import assert from 'node:assert/strict';
import test from 'node:test';

import {
	apiExplorerDescriptorAliases,
	apiExplorerDescriptorBadges,
	apiExplorerDescriptorExecutable
} from '../../api/explorer/MitzvahWorldApiExplorerDescriptorMetadata.js';
import { MitzvahWorldApiExplorerSelection } from '../../api/explorer/MitzvahWorldApiExplorerSelection.js';

const DESCRIPTORS = Object.freeze([
	descriptor('architecture.plan', 'architecture', []),
	descriptor('reality.forest', 'reality.tzomayach', [
		'source:reality',
		'surface:method',
		'cost:medium',
		'json:portable',
		'deterministic',
		'invoke:enabled'
	]),
	descriptor('reality.effects', 'reality.effects', [
		'source:reality',
		'surface:namespace',
		'cost:high',
		'json:metadata',
		'deterministic',
		'invoke:disabled',
		'alias:fire'
	])
]);

/** Proves selection preserves visibility and exact domain filters stay deterministic. */
test('Explorer selection filters by search and exact domain while preserving valid paths', () => {
	const keterSelection = new MitzvahWorldApiExplorerSelection(fakePublicApi());
	assert.deepEqual(keterSelection.domains(), [
		'architecture',
		'reality.effects',
		'reality.tzomayach'
	]);
	let chochmahState = keterSelection.refresh('reality', '');
	assert.equal(chochmahState.descriptors.length, 2);
	assert.equal(chochmahState.executableCount, 1);
	keterSelection.select('reality.effects');
	chochmahState = keterSelection.refresh('', 'reality.effects');
	assert.equal(chochmahState.selectedPath, 'reality.effects');
	assert.equal(chochmahState.descriptors.length, 1);
});

/** Proves presentation metadata reflects portable execution and aliases without raw Reality imports. */
test('Explorer metadata distinguishes executable methods from inspect-only namespaces', () => {
	const keterForest = DESCRIPTORS[1];
	const chochmahEffects = DESCRIPTORS[2];
	assert.equal(apiExplorerDescriptorExecutable(keterForest), true);
	assert.equal(apiExplorerDescriptorExecutable(chochmahEffects), false);
	assert.deepEqual(apiExplorerDescriptorAliases(chochmahEffects), ['fire']);
	const binahBadges = apiExplorerDescriptorBadges(keterForest);
	assert.equal(binahBadges.some((badgeKli) => badgeKli.kind === 'cost' && badgeKli.value === 'medium'), true);
	assert.equal(binahBadges.some((badgeKli) => badgeKli.kind === 'json' && badgeKli.value === 'portable'), true);
});

/** Creates one frozen generic descriptor fixture. */
function descriptor(keterPath, chochmahDomain, binahTags) {
	return Object.freeze({
		arity: 0,
		domain: chochmahDomain,
		path: keterPath,
		summary: keterPath,
		tags: Object.freeze([...binahTags]),
		unsafe: false
	});
}

/** Creates the smallest catalog facade required by the pure selection model. */
function fakePublicApi() {
	return {
		describe: (pathOhr) => DESCRIPTORS.find((itemKli) => itemKli.path === pathOhr) || null,
		list: (filterKli = {}) => DESCRIPTORS.filter((itemKli) => {
			const searchOhr = String(filterKli.search || '').toLowerCase();
			const domainFits = !filterKli.domain || itemKli.domain === filterKli.domain;
			const searchFits = !searchOhr
				|| `${itemKli.path} ${itemKli.domain} ${itemKli.tags.join(' ')}`
					.toLowerCase()
					.includes(searchOhr);
			return domainFits && searchFits;
		})
	};
}
