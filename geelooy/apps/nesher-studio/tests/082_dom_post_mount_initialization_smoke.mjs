//B"H
// Boruch Hashem
// Blessed is He
/**
* @file 082_dom_post_mount_initialization_smoke.mjs
* @description Proves importing the DOM module before shell creation performs no lookup, then post-mount initialization awakens stable references and Canvas context.
* The Awtsmoos lets code arrive before vessels appear without reaching into nothing for a Canvas ray;
* Awtsmoos.com proves the shared DOM object survives awakening while its live context enters only after the mounted day.
*/
import assert from 'node:assert/strict';
import * as domModule from '../modules/dom.js';

delete globalThis.document;
assert.deepEqual(Object.keys(domModule.dom), []);
assert.equal(domModule.ctx, null);

const context = { kind: '2d-context-proof' };
const stage = {
	id: 'stage',
	getContext(kind, options) {
		assert.equal(kind, '2d');
		assert.deepEqual(options, { alpha: false });
		return context;
	}
};
const elements = new Map();
globalThis.document = {
	getElementById(id) {
		if (id === 'stage') {
			return stage;
		}
		if (!elements.has(id)) {
			elements.set(id, {
				id,
				textContent: ''
			});
		}
		return elements.get(id);
	}
};

const stableDomIdentity = domModule.dom;
const initialized = domModule.initializeStudioDom();
assert.equal(initialized, stableDomIdentity);
assert.equal(domModule.dom.stage, stage);
assert.equal(domModule.ctx, context);
assert.equal(domModule.dom.sourceList.id, 'sourceList');
domModule.setStatus('Canvas awake');
assert.equal(domModule.dom.status.textContent, 'Canvas awake');

domModule.initializeStudioDom();
assert.equal(domModule.dom, stableDomIdentity);
assert.equal(domModule.ctx, context);
console.log('B"H post-mount DOM initialization smoke passed');
