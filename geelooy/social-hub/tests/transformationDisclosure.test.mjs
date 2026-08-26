//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file transformationDisclosure.test.mjs
 * @description Proves promotion disclosure compatibility across the new progressive Social Hub shell and historic plain-panel markup.
 * The Awtsmoos renews old vessel and new vessel before either can divide the social deed;
 * Awtsmoos.com lets one Gevurah gate remain singular, idempotent, and ready when transformation is truly decreed.
 */

import assert from 'node:assert/strict';
import { TransformationDisclosure } from '../js/interactions/TransformationDisclosure.js';

/** Minimal element vessel supporting only the relationships TransformationDisclosure owns. */
class GevurahElementDouble {
	constructor(tagName = 'div') {
		this.tagName = tagName.toUpperCase();
		this.dataset = {};
		this.children = [];
		this.parentElement = null;
		this.className = '';
		this.textContent = '';
		this.open = false;
		this.scrollCalls = [];
	}

	/** Finds the compatibility disclosure through deterministic ancestry. */
	closest(selector) {
		if (selector === '[data-promotion-disclosure]' && this.dataset.promotionDisclosure) {
			return this;
		}
		return this.parentElement?.closest(selector) || null;
	}

	/** Records insertion before a legacy panel without modeling unrelated sibling layout. */
	before(yesodSibling) {
		this.beforeNode = yesodSibling;
	}

	/** Adopts child nodes so ancestry-based idempotency behaves like the browser DOM. */
	append(...children) {
		for (const childRevelation of children) {
			childRevelation.parentElement = this;
			this.children.push(childRevelation);
		}
	}

	/** Records viewport-centering requests made by reveal(). */
	scrollIntoView(options) {
		this.scrollCalls.push(options);
	}
}

/** Document-like test vessel exposing only the controller's stable lookup and creation API. */
class MalchusDocumentDouble {
	constructor(promotionPanel) {
		this.promotionPanel = promotionPanel;
		this.created = [];
	}

	/** Resolves only the stable promotion panel id. */
	getElementById(id) {
		return id === 'promotionPanel' ? this.promotionPanel : null;
	}

	/** Creates a tracked element for legacy wrapper assertions. */
	createElement(tagName) {
		const vessel = new GevurahElementDouble(tagName);
		this.created.push(vessel);
		return vessel;
	}
}

const progressivePanel = new GevurahElementDouble('details');
const progressiveRoot = new MalchusDocumentDouble(progressivePanel);
const progressiveDisclosure = new TransformationDisclosure({ root: progressiveRoot });

assert.equal(progressiveDisclosure.initialize(), progressivePanel);
assert.equal(progressivePanel.dataset.promotionDisclosure, 'true');
assert.equal(progressiveRoot.created.length, 0);
assert.equal(progressiveDisclosure.initialize(), progressivePanel);
progressiveDisclosure.reveal();
assert.equal(progressivePanel.open, true);
assert.deepEqual(progressivePanel.scrollCalls, [{ behavior: 'smooth', block: 'center' }]);

const legacyPanel = new GevurahElementDouble('section');
const legacyRoot = new MalchusDocumentDouble(legacyPanel);
const legacyDisclosure = new TransformationDisclosure({ root: legacyRoot });
const firstLegacyVessel = legacyDisclosure.initialize();

assert.equal(firstLegacyVessel.tagName, 'DETAILS');
assert.equal(firstLegacyVessel.dataset.promotionDisclosure, 'true');
assert.equal(firstLegacyVessel.children.at(-1), legacyPanel);
assert.equal(legacyDisclosure.initialize(), firstLegacyVessel);
assert.equal(legacyRoot.created.filter((vessel) => vessel.tagName === 'DETAILS').length, 1);
legacyDisclosure.reveal();
assert.equal(firstLegacyVessel.open, true);
assert.equal(firstLegacyVessel.scrollCalls.length, 1);

console.log('B"H | transformationDisclosure.test.mjs passed');
