// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos reveals one ordered array of usable vessels without repeating hidden work;
 * these proofs bind layout, readiness, caching, and cleanup in the action bar of Awtsmoos.com.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { ActionBarSlotPresenter } from '../../ui/ActionBarSlotPresenter.js';

class FakeElement {
	constructor(tagName) {
		this.tagName = tagName;
		this.attributes = new Map();
		this.children = [];
		this.dataset = {};
		this.hidden = false;
		this.style = { setProperty() {} };
		this.textContent = '';
		this.className = '';
		this.classList = {
			contains: name => this.classes().has(name),
			toggle: (name, force) => this.toggleClass(name, force)
		};
	}

	classes() {
		return new Set(this.className.split(/\s+/).filter(Boolean));
	}

	toggleClass(name, force) {
		const names = this.classes();
		if (force) names.add(name);
		else names.delete(name);
		this.className = Array.from(names).join(' ');
	}

	append(...children) {
		this.children.push(...children);
	}

	appendChild(child) {
		this.children.push(child);
		return child;
	}

	replaceChildren(...children) {
		this.children = children.flatMap(child => child.tagName === 'fragment' ? child.children : [child]);
	}

	querySelector(selector) {
		const className = selector.startsWith('.') ? selector.slice(1) : '';
		for (const child of this.children) {
			if (child.classList?.contains(className)) return child;
			const nested = child.querySelector?.(selector);
			if (nested) return nested;
		}
		return null;
	}

	setAttribute(name, value) {
		this.attributes.set(name, String(value));
	}

	getAttribute(name) {
		return this.attributes.get(name);
	}
}

function installDocument() {
	const previous = globalThis.document;
	globalThis.document = {
		createDocumentFragment: () => new FakeElement('fragment'),
		createElement: tagName => new FakeElement(tagName)
	};
	return () => {
		globalThis.document = previous;
	};
}

test('slot presenter renders, caches, invalidates, snapshots, and cleans up', () => {
	const restoreDocument = installDocument();
	const grid = new FakeElement('div');
	const lock = new FakeElement('button');
	let recaches = 0;
	let invalidations = 0;
	const cooldowns = {
		invalidate: () => invalidations += 1,
		recache: () => recaches += 1
	};
	const runtime = {
		store: {
			snapshot: () => ({ locked: true, rows: 1, slots: Array(12).fill(null) })
		},
		timeline: {
			readiness() {
				throw new Error('Empty slots must not query ability readiness.');
			}
		}
	};
	try {
		const presenter = new ActionBarSlotPresenter(runtime, { grid, lock }, cooldowns);
		assert.equal(presenter.render(), 12);
		assert.equal(grid.children.length, 12);
		assert.equal(grid.dataset.rows, 1);
		assert.equal(lock.textContent, 'Layout locked');
		assert.equal(lock.getAttribute('aria-pressed'), 'true');
		assert.equal(recaches, 1);
		assert.equal(invalidations, 1);
		assert.equal(grid.children[0].getAttribute('aria-disabled'), 'true');
		assert.deepEqual(presenter.snapshot(), { cachedButtons: 12, domUpdates: 13 });
		assert.equal(presenter.refreshReadiness(), 12);
		assert.equal(invalidations, 2);
		presenter.destroy();
		assert.equal(presenter.snapshot().cachedButtons, 0);
	} finally {
		restoreDocument();
	}
});
