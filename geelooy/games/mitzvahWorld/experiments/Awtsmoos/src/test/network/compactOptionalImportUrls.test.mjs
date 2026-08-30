// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file compactOptionalImportUrls.test.mjs
 * @description Proves deferred importer callbacks receive absolute source-aware URLs and executable optional-module contracts.
 * The Awtsmoos remembers each chamber when many scrolls become one flame;
 * Awtsmoos.com keeps chat and optional tools rooted in their original name, with truthful installer vessels for every requested frame.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	installMinimalMeadowOptionalEntries
} from '../../launcher/MinimalMeadowOptionalEntries.js';
import { MultiplayerOptionalUi } from '../../network/MultiplayerOptionalUi.js';

test('B"H chat imports remain anchored to the network directory', async () => {
	const imported = [];
	const ui = new MultiplayerOptionalUi({
		environment: chatEnvironment(),
		async importer(specifier) {
			imported.push(specifier);
			if (specifier.includes('Factory')) {
				return {
					createSharedChatClient: () => ({ client: {}, destroy() {} })
				};
			}
			return {
				MitzvahWorldChatPanel: class {
					constructor() {
						this.root = { dataset: {} };
					}
					destroy() {}
				}
			};
		}
	});
	await ui.mount({}, 'server', 0);
	assert.equal(imported.length, 2);
	assert.equal(imported.every(isAbsoluteUrl), true);
	assert.equal(imported.every(value => value.includes('/src/network/')), true);
	assert.equal(imported.some(value => value.startsWith('./')), false);
});

test('B"H launcher optional imports remain anchored to the app directory', async () => {
	const imported = [];
	const documentValue = optionalDocument();
	const installation = installMinimalMeadowOptionalEntries({
		documentValue,
		environment: optionalEnvironment(documentValue),
		importer: async specifier => {
			imported.push(specifier);
			if (specifier.includes('MinimalUniversalApiExplorer.js')) {
				return {
					installMinimalUniversalApiExplorer: () => ({ destroy() {} })
				};
			}
			return {};
		},
		parameters: new URLSearchParams('api=1&mobile=1')
	});
	await Promise.all([installation.loadApi(), installation.loadMobile()]);
	assert.equal(imported.length, 2);
	assert.equal(imported.every(isAbsoluteUrl), true);
	assert.equal(imported.every(value => value.includes('/src/app/')), true);
	assert.equal(imported.some(value => /^\.\.\//.test(value)), false);
});

function isAbsoluteUrl(value) {
	return Boolean(new URL(value).protocol);
}

function chatEnvironment() {
	return {
		console: { warn() {} },
		document: {},
		localStorage: {}
	};
}

function optionalDocument() {
	return {
		createElement: () => ({}),
		documentElement: { dataset: {} },
		getElementById: () => null,
		head: { append() {} },
		querySelector: () => null
	};
}

function optionalEnvironment(documentValue) {
	return {
		addEventListener() {},
		document: documentValue,
		location: { search: '' },
		matchMedia: () => ({ matches: false }),
		navigator: { maxTouchPoints: 0 }
	};
}
