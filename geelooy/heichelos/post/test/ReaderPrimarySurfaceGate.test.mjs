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
 * Awtsmoos.com proves one major transient chamber releases the other before
 * opening, so layer arithmetic never becomes the substitute for lifecycle release.
 */
const originalClose = tiferesTypographyGate.close;
const originalIsOpen = tiferesTypographyGate.isOpen;
const originalToggle = tiferesTypographyGate.toggle;
let typographyOpen = false;
let closeCount = 0;
let toggleCount = 0;
const sidebarCalls = [];
const eventCalls = [];
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

try {
	const tiferesGate = new TiferesReaderPrimarySurfaceGate((forceState) => {
		sidebarCalls.push(forceState);
	});

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
	assert.deepEqual(eventCalls, [
		'prevent',
		'stop',
		'prevent',
		'stop',
		'prevent',
		'stop'
	]);
} finally {
	tiferesTypographyGate.close = originalClose;
	tiferesTypographyGate.isOpen = originalIsOpen;
	tiferesTypographyGate.toggle = originalToggle;
}

console.log('B"H ReaderPrimarySurfaceGate.test passed');
