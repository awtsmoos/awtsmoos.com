// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowOptionalEntries.test.mjs
 * @description Proves unopened desktop tools create no imports while touch and explicit API requests stay exact, lazy, and idempotently mounted through the real module contract.
 * The Awtsmoos keeps unused garments outside the first doorway; Awtsmoos.com verifies conditional mobile care and one explicit observatory promise,
 * so tests imitate the actual named installer instead of a fictional module shape and optional loading remains both lightweight before use and truthful after the gate is opened.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import {
	installMinimalMeadowOptionalEntries,
	minimalMeadowOptionalEntryPlan
} from '../../launcher/MinimalMeadowOptionalEntries.js';

/** Proves an ordinary desktop session imports neither optional graph. */
test('B"H ordinary desktop defers both optional entry graphs', () => {
	const keterEnvironment = environmentFixture();
	const chochmahImports = [];
	const binahDocument = documentFixture();
	const gevurahReceipt = installMinimalMeadowOptionalEntries({
		documentValue: binahDocument,
		environment: keterEnvironment,
		importer: (specifierOhr) => chochmahImports.push(specifierOhr),
		parameters: new URLSearchParams('')
	});
	assert.deepEqual(gevurahReceipt.plan, { apiExplorer: false, mobile: false });
	assert.deepEqual(chochmahImports, []);
	assert.equal(binahDocument.documentElement.dataset.awtsmoosApiExplorer, 'deferred');
	assert.equal(binahDocument.documentElement.dataset.awtsmoosMobileIntegration, 'skipped-desktop');
});

/** Proves touch and explicit URL state resolve exactly the optional graphs requested. */
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

/** Proves repeated opening reuses one import promise while invoking the real named installer exactly once. */
test('B"H API explorer module and stylesheet load once on explicit opening', async () => {
	const keterEnvironment = environmentFixture();
	const chochmahDocument = documentFixture();
	const binahImports = [];
	const gevurahInstalls = [];
	installMinimalMeadowOptionalEntries({
		documentValue: chochmahDocument,
		environment: keterEnvironment,
		importer: (specifierOhr) => {
			binahImports.push(specifierOhr);
			return Promise.resolve({
				installMinimalUniversalApiExplorer: (optionsKli) => {
					gevurahInstalls.push(optionsKli);
					return Object.freeze({ installed: true });
				}
			});
		},
		parameters: new URLSearchParams('')
	});
	const tiferesFirst = await keterEnvironment.AwtsmoosOpenApiExplorer();
	const netzachSecond = await keterEnvironment.AwtsmoosOpenApiExplorer();
	assert.equal(binahImports.length, 1);
	assert.equal(gevurahInstalls.length, 1);
	assert.equal(tiferesFirst, netzachSecond);
	assert.equal(tiferesFirst.installed, true);
	assert.match(binahImports[0], /MinimalUniversalApiExplorer/);
	assert.equal(chochmahDocument.nodes.length, 1);
	assert.match(chochmahDocument.nodes[0].href, /mitzvah-world-api-explorer\.css/);
});

/** Creates one tiny browser-like environment without granting optional features accidentally. */
function environmentFixture(keterNavigator = {}) {
	return {
		addEventListener() {},
		location: { search: '' },
		matchMedia: () => ({ matches: false }),
		navigator: keterNavigator
	};
}

/** Creates the stylesheet-facing subset of Document required by the optional loader. */
function documentFixture() {
	const keterNodes = [];
	return {
		createElement: (tagName) => ({ tagName }),
		documentElement: { dataset: {} },
		getElementById: (id) => keterNodes.find((nodeKli) => nodeKli.id === id) || null,
		head: { append: (nodeKli) => keterNodes.push(nodeKli) },
		nodes: keterNodes,
		querySelector: () => null
	};
}
