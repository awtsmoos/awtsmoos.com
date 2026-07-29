// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowOptionalEntries.test.mjs
 * @description Proves unopened desktop tools create no imports while touch and API requests stay exact.
 * The Awtsmoos keeps unused garments outside the first doorway; Awtsmoos.com verifies conditional
 * mobile care, explicit exploration, one stylesheet, and one module promise per optional entry.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	installMinimalMeadowOptionalEntries,
	minimalMeadowOptionalEntryPlan
} from '../../launcher/MinimalMeadowOptionalEntries.js';

test('B"H ordinary desktop defers both optional entry graphs', () => {
	const environment = environmentFixture();
	const imports = [];
	const documentValue = documentFixture();
	const receipt = installMinimalMeadowOptionalEntries({
		documentValue,
		environment,
		importer: specifier => imports.push(specifier),
		parameters: new URLSearchParams('')
	});
	assert.deepEqual(receipt.plan, { apiExplorer: false, mobile: false });
	assert.deepEqual(imports, []);
	assert.equal(documentValue.documentElement.dataset.awtsmoosApiExplorer, 'deferred');
	assert.equal(documentValue.documentElement.dataset.awtsmoosMobileIntegration, 'skipped-desktop');
});

test('B"H touch and explicit query produce exact optional plans', () => {
	assert.deepEqual(
		minimalMeadowOptionalEntryPlan('', environmentFixture({ maxTouchPoints: 2 })),
		{ apiExplorer: false, mobile: true }
	);
	assert.deepEqual(
		minimalMeadowOptionalEntryPlan('?api=1&mobile=true', environmentFixture()),
		{ apiExplorer: true, mobile: true }
	);
});

test('B"H API explorer module and stylesheet load once on explicit opening', async () => {
	const environment = environmentFixture();
	const documentValue = documentFixture();
	const imports = [];
	installMinimalMeadowOptionalEntries({
		documentValue,
		environment,
		importer: specifier => {
			imports.push(specifier);
			return Promise.resolve({ ready: true });
		},
		parameters: new URLSearchParams('')
	});
	await environment.AwtsmoosOpenApiExplorer();
	await environment.AwtsmoosOpenApiExplorer();
	assert.equal(imports.length, 1);
	assert.match(imports[0], /MinimalUniversalApiExplorer/);
	assert.equal(documentValue.nodes.length, 1);
	assert.match(documentValue.nodes[0].href, /mitzvah-world-api-explorer\.css/);
});

function environmentFixture(navigatorValue = {}) {
	return {
		addEventListener() {},
		location: { search: '' },
		matchMedia: () => ({ matches: false }),
		navigator: navigatorValue
	};
}

function documentFixture() {
	const nodes = [];
	return {
		createElement: tagName => ({ tagName }),
		documentElement: { dataset: {} },
		getElementById: id => nodes.find(node => node.id === id) || null,
		head: { append: node => nodes.push(node) },
		nodes
	};
}
