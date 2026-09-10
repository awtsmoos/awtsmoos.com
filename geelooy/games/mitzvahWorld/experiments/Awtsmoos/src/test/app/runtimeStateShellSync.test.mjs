//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file runtimeStateShellSync.test.mjs
 * @description Proves the HTML diagnostics root and visible Mitzvah World shell publish identical runtime readiness.
 * This prevents browser automation and users from seeing a stale starting marker after gameplay is already live.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	markRuntimePlayable,
	markRuntimeStarting
} from '../../app/RuntimeStateMarker.js';

function element() {
	return {
		dataset: {},
		setAttribute(name, value) {
			this[name] = String(value);
		}
	};
}

function documentFixture() {
	const documentElement = element();
	const shell = element();
	return {
		documentElement,
		getElementById(id) { return id === 'mitzvah-world-root' ? shell : null; },
		shell
	};
}

test('B"H runtime readiness stays synchronized across both public roots', () => {
	const documentValue = documentFixture();
	markRuntimeStarting(documentValue);
	for (const root of [documentValue.documentElement, documentValue.shell]) {
		assert.equal(root.dataset.awtsmoosRuntime, 'starting');
		assert.equal(root.dataset.awtsmoosRuntimeState, 'starting');
		assert.equal(root.dataset.awtsmoosGameplay, 'false');
	}

	markRuntimePlayable({
		runtime: {
			renderer: {
				backend: 'webgl',
				contextName: 'webgl',
				hydrationState: 'ready',
				render() {}
			}
		}
	}, documentValue);

	for (const root of [documentValue.documentElement, documentValue.shell]) {
		assert.equal(root.dataset.awtsmoosRuntime, 'playable');
		assert.equal(root.dataset.awtsmoosRuntimeState, 'playable');
		assert.equal(root.dataset.awtsmoosGameplay, 'true');
		assert.equal(root['aria-busy'], 'false');
	}
});
