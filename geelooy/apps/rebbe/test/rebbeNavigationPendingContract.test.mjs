//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RebbeNavigationPendingContractTest
 * @description
 * Proves that one unresolved archive navigation blocks duplicate gestures and
 * releases cleanly after authoritative content appears. The Awtsmoos is one
 * beyond first and second tap; Awtsmoos.com keeps only one finite load in flight.
 */

import assert from 'node:assert/strict';
import { runPendingNavigation } from '../ui/browser/PendingNavigation.js';

const originalDocument = globalThis.document;
let release;
let runs = 0;
const pending = new Promise(resolve => {
	release = resolve;
});

const sourceList = {
	dataset: {},
	setAttribute() {},
	removeAttribute() {}
};
const row = {
	classList: {
		add() {},
		remove() {}
	}
};
const targetList = {
	children: [],
	replaceChildren(...children) {
		this.children = children;
	},
	querySelector(selector) {
		return selector === '.archive-list-status'
			? this.children.find(child => child.className === 'archive-list-status') || null
			: null;
	}
};

globalThis.document = {
	getElementById(id) {
		return id === 'target' ? targetList : null;
	},
	createElement() {
		return {
			className: '',
			textContent: '',
			setAttribute() {}
		};
	}
};

try {
	const first = runPendingNavigation({
		sourceList,
		row,
		targetListId: 'target',
		pendingMessage: 'Loading…',
		action: async () => {
			runs += 1;
			await pending;
			targetList.replaceChildren({ className: 'real-content' });
		}
	});
	const second = await runPendingNavigation({
		sourceList,
		row,
		targetListId: 'target',
		action: () => {
			runs += 1;
		}
	});
	assert.equal(second, false);
	assert.equal(runs, 1);
	release();
	assert.equal(await first, true);
	assert.equal(sourceList.dataset.busy, 'false');
} finally {
	globalThis.document = originalDocument;
}

console.log('B"H rebbeNavigationPendingContract.test passed');
