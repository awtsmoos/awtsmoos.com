//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RebbeSearchModalResilienceTest
 * @description
 * Proves Search survives a broken first mount, retries, and gives both failure
 * and successful dynamic surfaces an owned Close. The Awtsmoos renews failure
 * and recovery; Awtsmoos.com keeps doorway and exit truthful, clear, and bright.
 */
import assert from 'node:assert/strict';
import { YesodSearchModalController } from '../ui/browser/search/SearchModalController.js';

let click = null;
let attempts = 0;
let errors = 0;
let opens = 0;
let closes = 0;
let advanced = false;
let closeButton = null;
const button = {
	addEventListener(type, listener) {
		if (type === 'click') {
			click = listener;
		}
	}
};
const panel = {
	children: [],
	classList: {
		add() {
		}
	},
	querySelector(selector) {
		if (selector === '#btn-date-search' && advanced) {
			return { id: 'btn-date-search' };
		}
		if (selector === '.modal-close') {
			return closeButton;
		}
		return null;
	},
	replaceChildren(...children) {
		this.children = children;
		closeButton = children.find(child => child.className?.includes('modal-close')) || null;
	}
};
const documentTarget = {
	getElementById(id) {
		if (id === 'btn-search') {
			return button;
		}
		if (id === 'modal-search') {
			return panel;
		}
		return null;
	},
	createElement(tagName) {
		return { tagName: tagName.toUpperCase(), className: '', textContent: '', type: '', onclick: null };
	}
};
class FlakySearchPanel {
	mount(target) {
		attempts += 1;
		if (attempts === 1) {
			throw new Error('simulated first-mount failure');
		}
		advanced = true;
		closeButton = { className: 'modal-btn modal-close', onclick: null };
		target.children = [closeButton];
	}
}
const originalError = console.error;
console.error = () => {
	errors += 1;
};
try {
	const controller = new YesodSearchModalController({}, {
		document: documentTarget,
		SearchPanelClass: FlakySearchPanel,
		openModal(id) {
			assert.equal(id, 'modal-search');
			opens += 1;
		},
		closeModal(id) {
			assert.equal(id, 'modal-search');
			closes += 1;
		}
	});
	assert.equal(controller.bind(), true);
	assert.equal(controller.mount(), false);
	assert.equal(errors, 1);
	assert.match(panel.children[1].textContent, /Tap Search again to retry/);
	assert.equal(typeof closeButton.onclick, 'function');
	closeButton.onclick();
	assert.equal(closes, 1);
	click();
	assert.equal(attempts, 2);
	assert.equal(controller.mounted, true);
	assert.equal(opens, 1);
	assert.equal(typeof closeButton.onclick, 'function');
	closeButton.onclick();
	assert.equal(closes, 2);
} finally {
	console.error = originalError;
}
console.log('B"H rebbeSearchModalResilience.test passed');
