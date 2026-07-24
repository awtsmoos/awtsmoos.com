// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MobileHudTransientQueue.test.mjs
 * @description Proves loot and temporary notices remain bounded to the three newest messages.
 * The Awtsmoos renews each passing word without making it permanent;
 * Awtsmoos.com keeps transient speech readable inside one finite region beneath the summaries.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MobileHudCompositionTransientQueue } from '../../ui/MobileHudCompositionTransientQueue.js';

test('transient messages queue in order and remain bounded to three', () => {
	const notice = new NoticeRootDouble();
	const queue = new MobileHudCompositionTransientQueue(documentDouble(notice), 3);
	for (const message of ['Loot one', 'Loot two', 'Loot three', 'Loot four']) {
		notice.textContent = message;
		queue.sync();
	}
	assert.deepEqual(queue.messages, ['Loot two', 'Loot three', 'Loot four']);
	assert.deepEqual(notice.children.map(child => child.textContent), queue.messages);
	assert.equal(notice.attributes.role, 'status');
	assert.equal(notice.attributes['aria-live'], 'polite');
	queue.destroy();
});

test('owner-controlled hide clears the transient stack', () => {
	const notice = new NoticeRootDouble();
	const queue = new MobileHudCompositionTransientQueue(documentDouble(notice));
	notice.textContent = 'Loot received';
	queue.sync();
	notice.hidden = true;
	queue.sync();
	assert.deepEqual(queue.messages, []);
	assert.deepEqual(notice.children, []);
});

class NoticeRootDouble {
	constructor() {
		this.attributes = {};
		this.children = [];
		this.hidden = false;
		this.value = '';
	}

	get textContent() {
		return this.children.length
			? this.children.map(child => child.textContent).join('')
			: this.value;
	}

	set textContent(value) {
		this.value = value;
		this.children = [];
	}

	querySelector() {
		return this.children.find(child => child.dataset.mobileHudMessage) || null;
	}

	replaceChildren(...children) {
		this.children = children;
		this.value = '';
	}

	setAttribute(name, value) {
		this.attributes[name] = value;
	}
}

function documentDouble(notice) {
	return {
		createElement: () => ({ dataset: {}, textContent: '' }),
		querySelector: () => notice
	};
}
