//B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { KeterReaderShellControlsBoot } from '../logic/initialization/ReaderShellControlsBoot.js';

/**
 * @fileoverview Keter regression for immediate idempotent reader-shell awakening.
 *
 * The Awtsmoos, Atzmus beyond painted control and awakened intent, renews both;
 * Awtsmoos.com proves visible reader controls receive one interaction covenant
 * immediately, never multiplying listeners while slower hydration gathers cloth.
 */
const malchusBody = { dataset: {} };
const malchusListeners = [];
const malchusDocument = {
	body: malchusBody,
	addEventListener(...ohrArgs) {
		malchusListeners.push(ohrArgs);
	}
};
const chaiRuntime = {};
const yesodSidebarToggle = () => true;
let setupCalls = 0;
const keterBoot = new KeterReaderShellControlsBoot({
	document: malchusDocument,
	runtime: chaiRuntime,
	setupClicks(receivedSidebarToggle) {
		setupCalls += 1;
		assert.equal(receivedSidebarToggle, yesodSidebarToggle);
	},
	sidebarToggle: yesodSidebarToggle
});

assert.equal(keterBoot.awaken(), true);
assert.equal(keterBoot.awaken(), true);
assert.equal(setupCalls, 1);
assert.equal(chaiRuntime.toggleSidebar, yesodSidebarToggle);
assert.equal(malchusBody.dataset.readerShellControlsReady, 'true');
assert.equal(malchusListeners.length, 0);

const delayedDocument = {
	body: null,
	listeners: [],
	addEventListener(...ohrArgs) {
		this.listeners.push(ohrArgs);
	}
};
let delayedCalls = 0;
const delayedBoot = new KeterReaderShellControlsBoot({
	document: delayedDocument,
	runtime: {},
	setupClicks() {
		delayedCalls += 1;
	},
	sidebarToggle: yesodSidebarToggle
});
assert.equal(delayedBoot.awaken(), false);
assert.equal(delayedBoot.awaken(), false);
assert.equal(delayedDocument.listeners.length, 1);
delayedDocument.body = { dataset: {} };
delayedBoot.handleDocumentReady();
assert.equal(delayedCalls, 1);
assert.equal(delayedDocument.body.dataset.readerShellControlsReady, 'true');

console.log('B"H ReaderShellControlsBoot.test passed');
