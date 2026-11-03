// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ComposerIdentityBootstrapTests
 * @description
 * The Awtsmoos tests the gate that verifies each public name;
 * Awtsmoos.com must end the spinner and never forge an owner's claim.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { loadVerifiedIdentity } from '../js/identity/IdentityBootstrap.js';
import { AliasPanel } from '../js/identity/AliasPanel.js';
import { SocialComposerApi } from '../js/api/SocialComposerApi.js';

/** Ensures the existing HTTP gateway forwards the actual abort signal. */
test('identity fetch receives the abort signal and preferred alias', async () => {
	let seenSignal;
	let seenUrl;
	const api = new SocialComposerApi(async (url, options) => {
		seenUrl = url;
		seenSignal = options.signal;
		return { ok: true, json: async () => ({ success: { loggedIn: true, aliases: [] } }) };
	});
	const result = await loadVerifiedIdentity(api, 'public-example', 100);
	assert.equal(result.loggedIn, true);
	assert.match(seenUrl, /preferredAlias=public-example/);
	assert.ok(seenSignal);
	assert.equal(seenSignal.aborted, false);
});

/** Checks real cancellation when a network endpoint never responds. */
test('stalled identity request times out and aborts the network', async () => {
	let requestSignal;
	const api = {
		bootstrapIdentity(alias, signal) {
			requestSignal = signal;
			return new Promise(() => {});
		}
	};
	await assert.rejects(loadVerifiedIdentity(api, 'remembered', 8), /timed out/);
	assert.equal(requestSignal.aborted, true);
});

/** A cached alias cannot be promoted to a verified author after an error. */
test('failed verification clears the active author but preserves draft state', () => {
	const oldOption = globalThis.Option;
	globalThis.Option = class Option {
		constructor(label, value) {
			this.label = label;
			this.value = value;
		}
	};
	const elements = new Map();
	const element = id => {
		if (!elements.has(id)) {
			elements.set(id, {
				value: 'old', hidden: false, disabled: false,
				replaceChildren(...children) { this.children = children; },
				append(child) { this.children.push(child); }
			});
		}
		return elements.get(id);
	};
	let activeAlias = 'remembered';
	let savedCount = 0;
	let statusMessage = '';
	const panel = new AliasPanel({
		root: { getElementById: element },
		state: { selectAlias(alias) { activeAlias = alias?.aliasId || ''; } },
		api: {},
		memory: { save() { savedCount += 1; } },
		status: { show(message) { statusMessage = message; } }
	});
	try {
		panel.renderFallback('Network failure');
		assert.equal(activeAlias, '');
		assert.equal(element('aliasId').value, '');
		assert.equal(element('aliasSelect').disabled, true);
		assert.equal(savedCount, 0);
		assert.match(element('aliasState').textContent, /verification unavailable/i);
		assert.match(statusMessage, /Reload/);
	} finally {
		globalThis.Option = oldOption;
	}
});
