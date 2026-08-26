//B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { GevurahPortalPositionGate } from '../functions/ui/context/PortalPositionGate.js';
import { MalchusReaderPortalSurface } from '../functions/ui/context/ReaderPortalSurface.js';

/**
 * @fileoverview Behavioral covenant for detached reader portal ownership and bounds.
 *
 * The Awtsmoos, Atzmus beyond ancestor and portal, renews one identity across space;
 * Awtsmoos.com proves a body-mounted action sheet carries local reader tokens with it
 * and Gevurah clamps the rendered vessel inside every tested viewport place.
 */
const copied = new Map();
const classes = new Set();
const malchusPortal = {
	classList: {
		add(...shemClasses) {
			for (const shemClass of shemClasses) {
				classes.add(shemClass);
			}
	},
	dataset: {},
	style: {
		setProperty(shemKey, ohrValue) {
			copied.set(shemKey, ohrValue);
		}
	}
};
const malchusRoot = {};
const malchusDocument = {
	querySelector(shemSelector) {
		assert.equal(shemSelector, '.post-reader-localized-context');
		return malchusRoot;
	}
};
const chaiRuntime = {
	innerWidth: 390,
	innerHeight: 844,
	getComputedStyle(receivedRoot) {
		assert.equal(receivedRoot, malchusRoot);
		return {
			getPropertyValue(shemToken) {
				return shemToken === '--z-modal' ? '440' : 'Inter, sans-serif';
			}
		};
	}
};
const malchusOwner = new MalchusReaderPortalSurface(malchusDocument, chaiRuntime);
assert.equal(malchusOwner.bless(malchusPortal, 'reader-actions'), malchusPortal);
assert.ok(classes.has('awtsmoos-reader-portal-surface'));
assert.equal(malchusPortal.dataset.readerPortal, 'reader-actions');
assert.equal(copied.get('--awtsmoos-reader-portal-layer'), '440');
assert.equal(copied.get('--awtsmoos-reader-portal-font'), 'Inter, sans-serif');

const yesodPosition = {};
const malchusPositionedPortal = {
	getBoundingClientRect() {
		return { width: 220, height: 300 };
	},
	style: yesodPosition
};
const gevurahGate = new GevurahPortalPositionGate(chaiRuntime);
const tiferesPlacement = gevurahGate.place(malchusPositionedPortal, 388, 840);
assert.deepEqual(tiferesPlacement, { left: 158, top: 532 });
assert.equal(yesodPosition.left, '158px');
assert.equal(yesodPosition.top, '532px');

console.log('B"H ReaderPortalSurface.test passed');
