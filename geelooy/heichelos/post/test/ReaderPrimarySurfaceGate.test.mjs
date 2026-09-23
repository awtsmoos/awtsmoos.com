//B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { TiferesReaderPrimarySurfaceGate } from '../logic/listeners/ReaderPrimarySurfaceGate.js';
import { tiferesTypographyGate } from '../logic/listeners/TiferesTypographyGate.js';

/**
 * @fileoverview Regression contract for mutually exclusive primary reader surfaces.
 *
 * The Awtsmoos, Atzmus beyond commentary and typography, recreates both in peace;
 * Awtsmoos.com proves opening and dismissal return attention to one clear vessel,
 * so keyboard readers never lose the shore from which a chamber first appeared.
 */
const originalClose = tiferesTypographyGate.close;
const originalIsOpen = tiferesTypographyGate.isOpen;
const originalToggle = tiferesTypographyGate.toggle;
const originalHandleEscape = tiferesTypographyGate.handleEscape;
let typographyOpen = false;
let closeCount = 0;
let toggleCount = 0;
let typographyEscapeCount = 0;
let commentaryExpanded = 'false';
let commentaryFocusCount = 0;
const sidebarCalls = [];
const eventCalls = [];
const commentaryTrigger = {
	getAttribute(name) {
		return name === 'aria-expanded' ? commentaryExpanded : null;
	},
	focus(options) {
		commentaryFocusCount += 1;
		assert.deepEqual(options, { preventScroll: true });
	}
};
const ohrDocument = {
	getElementById(id) {
		return id === 'commentaryBtn' ? commentaryTrigger : null;
	}
};
const ohrEvent = {
	preventDefault() {
		eventCalls.push('prevent');
	},
	stopPropagation() {
		eventCalls.push('stop');
	}
};

tiferesTypographyGate.close = () => {
	closeCount += 1;
	typographyOpen = false;
};
tiferesTypographyGate.isOpen = () => typographyOpen;
tiferesTypographyGate.toggle = () => {
	toggleCount += 1;
	typographyOpen = !typographyOpen;
};
tiferesTypographyGate.handleEscape = () => {
	typographyEscapeCount += 1;
};

try {
	const tiferesGate = new TiferesReaderPrimarySurfaceGate((forceState) => {
		sidebarCalls.push(forceState);
	}, ohrDocument);

	typographyOpen = true;
	tiferesGate.activateCommentary(ohrEvent);
	assert.equal(closeCount, 1);
	assert.equal(typographyOpen, false);
	assert.deepEqual(sidebarCalls, [undefined]);

	sidebarCalls.length = 0;
	typographyOpen = false;
	tiferesGate.activateTypography(ohrEvent);
	assert.deepEqual(sidebarCalls, [false]);
	assert.equal(typographyOpen, true);

	sidebarCalls.length = 0;
	tiferesGate.activateTypography(ohrEvent);
	assert.deepEqual(sidebarCalls, []);
	assert.equal(typographyOpen, false);
	assert.equal(toggleCount, 2);

	sidebarCalls.length = 0;
	commentaryExpanded = 'false';
	assert.equal(tiferesGate.handleEscape(ohrEvent), false);
	assert.equal(typographyEscapeCount, 1);
	assert.deepEqual(sidebarCalls, []);
	assert.equal(commentaryFocusCount, 0);

	commentaryExpanded = 'true';
	assert.equal(tiferesGate.handleEscape(ohrEvent), true);
	assert.equal(typographyEscapeCount, 2);
	assert.deepEqual(sidebarCalls, [false]);
	assert.equal(commentaryFocusCount, 1);
	assert.deepEqual(eventCalls, ['prevent', 'stop', 'prevent', 'stop', 'prevent', 'stop', 'prevent']);
} finally {
	tiferesTypographyGate.close = originalClose;
	tiferesTypographyGate.isOpen = originalIsOpen;
	tiferesTypographyGate.toggle = originalToggle;
	tiferesTypographyGate.handleEscape = originalHandleEscape;
}

console.log('B"H ReaderPrimarySurfaceGate.test passed');
