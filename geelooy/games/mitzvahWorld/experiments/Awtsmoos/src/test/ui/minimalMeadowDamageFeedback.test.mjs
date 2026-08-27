// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowDamageFeedback.test.mjs
 * @description Proves successful combat impact becomes a clamped numeric action testimony.
 * The Awtsmoos reveals measured consequence without stealing touch; Awtsmoos.com keeps the number,
 * action letters, world projection, defeat state, brief lifetime, and cleanup explicit and bounded.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { AwtsmoosEventBus } from '../../ui/AwtsmoosEventBus.js';
import { MinimalMeadowDamageFeedback } from '../../ui/MinimalMeadowDamageFeedback.js';
import {
	minimalMeadowWorldToScreen
} from '../../ui/MinimalMeadowScreenProjection.js';

class Element {
	constructor(tagName) {
		this.tagName = tagName;
		this.children = [];
		this.dataset = {};
		this.style = { values: {}, setProperty: (key, value) => { this.style.values[key] = value; } };
	}
	append(...children) { this.children.push(...children); }
	remove() { this.removed = true; }
	setAttribute() {}
}

function documentFixture() {
	const body = new Element('body');
	const head = new Element('head');
	return {
		body,
		createElement: tagName => new Element(tagName),
		getElementById: () => null,
		head,
		querySelector: () => null
	};
}

test('B"H damage receipt renders exact number, letters, and action label', () => {
	const bus = new AwtsmoosEventBus();
	const documentValue = documentFixture();
	const timers = [];
	const runtime = {
		bus,
		camera: {
			aspect: 1,
			fov: 45,
			position: { x: 0, y: 2, z: 5 },
			target: { x: 0, y: 1, z: 0 }
		},
		canvas: {
			getBoundingClientRect: () => ({ bottom: 400, height: 400, left: 0, right: 400, top: 0, width: 400 })
		}
	};
	const feedback = new MinimalMeadowDamageFeedback(runtime, documentValue, {
		setTimeout(callback) { timers.push(callback); }
	});
	bus.emit('combat:impact', {
		damage: 17,
		defeated: true,
		label: 'Flame of Aleph',
		letters: 'אש',
		position: { x: 0, y: 1.5, z: 0 }
	});
	assert.equal(feedback.active.size, 1);
	const output = [...feedback.active][0];
	assert.equal(output.dataset.defeated, 'true');
	assert.equal(output.children[0].textContent, '−17');
	assert.equal(output.children[1].textContent, 'אש · Flame of Aleph');
	assert.match(output.style.values['--damage-x'], /px$/);
	timers[0]();
	assert.equal(feedback.active.size, 0);
	feedback.destroy();
});

test('B"H world projection clamps feedback inside mobile margins', () => {
	const result = minimalMeadowWorldToScreen(
		{ aspect: 1, fov: 45, position: { x: 0, y: 2, z: 5 }, target: { x: 0, y: 1, z: 0 } },
		{ getBoundingClientRect: () => ({ bottom: 300, height: 300, left: 0, right: 200, top: 0, width: 200 }) },
		{ x: 100, y: 1, z: 0 },
		48
	);
	assert.ok(result.x >= 48 && result.x <= 152);
	assert.ok(result.y >= 48 && result.y <= 252);
});
