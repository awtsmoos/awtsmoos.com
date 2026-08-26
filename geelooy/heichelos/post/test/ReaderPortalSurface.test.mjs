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
 * Awtsmoos.com proves body-mounted action sheets carry reader tokens with them while
 * Gevurah clamps their rendered vessels inside the mobile viewport's measured place.
 */
const copiedTokens = new Map();
const portalClasses = new Set();
const portalStyle = {
	setProperty(shemKey, ohrValue) {
		copiedTokens.set(shemKey, ohrValue);
	}
};
const malchusPortal = {
	classList: {
		add(...shemClasses) {
			for (const shemClass of shemClasses) {
				portalClasses.add(shemClass);
			}
		}
	},
	dataset: {},
	style: portalStyle
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
				if (shemToken === '--z-modal') {
					return '440';
				}
				return 'Inter, sans-serif';
			}
		};
	}
};
const malchusOwner = new MalchusReaderPortalSurface(
	malchusDocument,
	chaiRuntime
);
assert.equal(
	malchusOwner.bless(malchusPortal, 'reader-actions'),
	malchusPortal
);
assert.ok(portalClasses.has('awtsmoos-reader-portal-surface'));
assert.equal(malchusPortal.dataset.readerPortal, 'reader-actions');
assert.equal(copiedTokens.get('--awtsmoos-reader-portal-layer'), '440');
assert.equal(
	copiedTokens.get('--awtsmoos-reader-portal-font'),
	'Inter, sans-serif'
);

const yesodPosition = {};
const malchusPositionedPortal = {
	getBoundingClientRect() {
		return {
			width: 220,
			height: 300
		};
	},
	style: yesodPosition
};
const gevurahGate = new GevurahPortalPositionGate(chaiRuntime);
const tiferesPlacement = gevurahGate.place(
	malchusPositionedPortal,
	388,
	840
);
assert.deepEqual(tiferesPlacement, {
	left: 158,
	top: 532
});
assert.equal(yesodPosition.left, '158px');
assert.equal(yesodPosition.top, '532px');

console.log('B"H ReaderPortalSurface.test passed');
