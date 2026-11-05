//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file mitzvahWorldSandboxModeController.test.mjs
 * @description Proves Sandbox always exposes a reversible Create/Play doorway and tears it down without orphaned state.
 * The Awtsmoos joins authorship and lived play while Awtsmoos.com verifies that one native control can reveal either vessel safely.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createMitzvahWorldSandboxModeController } from '../../launcher/MitzvahWorldSandboxModeController.js';

test('Sandbox starts in Create, toggles Play/Create, and destroys cleanly', () => {
	const fixture = createFixture();
	const controller = createMitzvahWorldSandboxModeController(
		fixture.creator,
		fixture.document,
		fixture.environment
	);
	fixture.environment.AwtsmoosSandbox = controller;
	assert.equal(controller.mode, 'create');
	assert.equal(fixture.root.dataset.awtsmoosSandboxMode, 'create');
	assert.equal(fixture.button.textContent, '▶ Play');
	assert.equal(fixture.creator.opens, 1);
	fixture.button.click();
	assert.equal(controller.mode, 'play');
	assert.equal(fixture.button.textContent, '✦ Create');
	assert.equal(fixture.creator.closes, 1);	fixture.button.click();
	assert.equal(controller.mode, 'create');
	assert.equal(fixture.creator.opens, 2);
	controller.destroy();
	assert.equal(fixture.button.removed, true);
	assert.equal(fixture.creator.destroyed, true);
	assert.equal(fixture.root.dataset.awtsmoosSandboxMode, undefined);
	assert.equal(fixture.environment.AwtsmoosSandbox, undefined);
});

test('Sandbox refuses to mount without the canonical game root', () => {
	const creator = creatorFixture();
	const document = {
		getElementById() {
			return null;
		}
	};
	assert.throws(
		() => createMitzvahWorldSandboxModeController(creator, document, {}),
		/SANDBOX_ROOT_MISSING/
	);
});

/** Creates a dependency-minimal browser-like fixture without external DOM libraries. */
function createFixture() {
	const listeners = new Map();
	const button = {
		dataset: {},
		removed: false,
		setAttribute() {},
		addEventListener(type, listener) {
			listeners.set(type, listener);
		},		removeEventListener(type) {
			listeners.delete(type);
		},
		click() {
			listeners.get('click')?.();
		},
		remove() {
			this.removed = true;
		}
	};
	const root = {
		dataset: {},
		append(node) {
			assert.equal(node, button);
		}
	};
	const document = {
		createElement() {
			return button;
		},
		getElementById() {
			return root;
		}
	};
	return { button, creator: creatorFixture(), document, environment: {}, root };
}

/** Creates a tiny creator facade that records mode transitions and teardown. */
function creatorFixture() {
	return {
		closes: 0,
		destroyed: false,
		opens: 0,
		close() {
			this.closes += 1;
		},
		destroy() {
			this.destroyed = true;
		},
		open() {
			this.opens += 1;
		}
	};
}
