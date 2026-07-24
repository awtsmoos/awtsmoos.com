// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowGameRailMode.test.mjs
 * @description Proves the right-rail Walk/Run control, accessibility state, collapse, and cleanup.
 * The Awtsmoos gives pace a visible vessel; Awtsmoos.com keeps secondary menus from hiding it.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	MinimalMeadowGameRail,
	movementModePresentation
} from '../../ui/MinimalMeadowGameRail.js';

test('right rail presents current mode and emits the existing toggle contract', () => {
	const bus = createBus();
	const elements = createElements();
	const rail = new MinimalMeadowGameRail(elements.host, bus);
	assert.equal(elements.label.textContent, 'Walk');
	assert.equal(elements.mode.attributes['aria-pressed'], 'false');
	bus.emit('mode:changed', { runMode: true });
	assert.equal(elements.label.textContent, 'Run');
	assert.equal(elements.mode.attributes['aria-pressed'], 'true');
	rail.handleClick({ target: targetFor('[data-mode-toggle]') });
	assert.deepEqual(bus.emissions.at(-1), {
		detail: { source: 'right-rail' },
		name: 'mode:toggle'
	});
	assert.equal(rail.diagnostics().mode, 'run');
	rail.destroy();
	assert.equal(bus.listenerCount('mode:changed'), 0);
});

test('collapsing secondary actions leaves movement mode independently visible', () => {
	const bus = createBus();
	const elements = createElements();
	const rail = new MinimalMeadowGameRail(elements.host, bus);
	rail.toggle();
	assert.equal(elements.secondary.hidden, true);
	assert.equal(elements.collapse.attributes['aria-expanded'], 'false');
	assert.equal(elements.mode.hidden, false);
	assert.equal(rail.diagnostics().collapsed, true);
	assert.equal(movementModePresentation(false).label, 'Walk');
	assert.equal(movementModePresentation(true).label, 'Run');
});

function createBus() {
	const listeners = new Map();
	const emissions = [];
	return {
		emissions,
		emit(name, detail) {
			emissions.push({ detail, name });
			for (const listener of listeners.get(name) || []) listener(detail);
		},
		listenerCount(name) {
			return listeners.get(name)?.size || 0;
		},
		on(name, listener) {
			if (!listeners.has(name)) listeners.set(name, new Set());
			listeners.get(name).add(listener);
			return () => listeners.get(name)?.delete(listener);
		}
	};
}

function createElements() {
	const icon = node();
	const label = node();
	const mode = node({
		'[data-mode-icon]': icon,
		'[data-mode-label]': label
	});
	const collapse = node();
	const secondary = node();
	const rail = node();
	const elements = { collapse, icon, label, mode, rail, secondary };
	elements.host = {
		addEventListener() {},
		className: '',
		innerHTML: '',
		querySelector(selector) {
			return {
				'.Awtsmoos-game-rail': rail,
				'[data-mode-toggle]': mode,
				'[data-rail-collapse]': collapse,
				'[data-rail-secondary]': secondary
			}[selector];
		},
		removeEventListener() {}
	};
	return elements;
}

function node(children = {}) {
	return {
		attributes: {},
		dataset: {},
		hidden: false,
		querySelector: selector => children[selector],
		setAttribute(name, value) {
			this.attributes[name] = value;
		},
		textContent: '',
		title: ''
	};
}

function targetFor(activeSelector) {
	return {
		closest(selector) {
			return selector === activeSelector ? {} : null;
		}
	};
}
