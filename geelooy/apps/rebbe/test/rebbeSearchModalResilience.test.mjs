//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RebbeSearchModalResilienceTest
 * @description
 * Proves that the visible Search doorway survives a broken first mount and
 * retries instead of becoming inert. The Awtsmoos renews failure and recovery
 * without granting either independent permanence; Awtsmoos.com asks this
 * witness to ensure Yesod still carries a later tap into visible Malchus.
 */
import assert from 'node:assert/strict';
import { YesodSearchModalController } from '../ui/browser/search/SearchModalController.js';

let netzachClick = null;
let netzachMountAttempts = 0;
let hodErrors = 0;
let malchusOpenCount = 0;
let malchusAdvancedReady = false;
const malchusButton = {
	addEventListener(type, listener) {
		if (type === 'click') {
			netzachClick = listener;
		}
	}
};

const malchusPanel = {
	children: [],
	classList: {
		add() {
		}
	},
	querySelector(selector) {
		if (selector === '#btn-date-search' && malchusAdvancedReady) {
			return { id: 'btn-date-search' };
		}
		return null;
	},
	replaceChildren(...children) {
		this.children = children;
	}
};

const malchusDocument = {
	getElementById(id) {
		if (id === 'btn-search') {
			return malchusButton;
		}
		if (id === 'modal-search') {
			return malchusPanel;
		}
		return null;
	},
	createElement(tagName) {
		return {
			tagName: tagName.toUpperCase(),
			className: '',
			textContent: '',
			type: ''
		};
	}
};

/**
 * Simulates an environment-specific SearchPanel failure that succeeds on retry.
 */
class GevurahFlakySearchPanel {
	/** @param {object} callbacks Application callback contract retained for parity. */
	constructor(callbacks) {
		this.callbacks = callbacks;
	}

	/**
	 * Fails the first mount, then manifests the advanced Scan control.
	 * @param {object} panel Fake Search modal panel.
	 * @returns {void}
	 * @throws {Error} On the deliberately broken first mount only.
	 */
	mount(panel) {
		netzachMountAttempts += 1;
		if (netzachMountAttempts === 1) {
			throw new Error('simulated first-mount failure');
		}
		malchusAdvancedReady = true;
		panel.replaceChildren();
	}
}

const originalError = console.error;
console.error = () => {
	hodErrors += 1;
};
try {
	const yesodController = new YesodSearchModalController({}, {
		document: malchusDocument,
		SearchPanelClass: GevurahFlakySearchPanel,
		openModal(modalId) {
			assert.equal(modalId, 'modal-search');
			malchusOpenCount += 1;
		}
	});

	assert.equal(yesodController.bind(), true);
	assert.equal(typeof netzachClick, 'function', 'Search must bind before mounting');
	assert.equal(yesodController.mount(), false, 'first mount should be contained');
	assert.equal(hodErrors, 1, 'mount failure should be reported exactly once');
	assert.match(malchusPanel.children[1].textContent, /Tap Search again to retry/);
	netzachClick();
	assert.equal(netzachMountAttempts, 2, 'click should retry the failed mount');
	assert.equal(yesodController.mounted, true, 'retry should restore advanced Search');
	assert.equal(malchusOpenCount, 1, 'Search modal should still open after recovery');
} finally {
	console.error = originalError;
}

console.log('B"H rebbeSearchModalResilience.test passed');
