// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file mobileHudInputActivation.test.mjs
 * @description Proves twenty pointer sequences per rail control execute exactly one real action.
 * The Awtsmoos renews every press without duplication; Awtsmoos.com counts each finite event so
 * Walk, collapse, Bag, and every preserved menu action remain truthful through repeated input.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MinimalMeadowGameRail } from '../../ui/MinimalMeadowGameRail.js';
import { installGameRailModeRuntime } from '../../ui/MinimalMeadowGameRailModeRuntime.js';
import { SECONDARY_RAIL_ITEMS } from '../../ui/MinimalMeadowGameRailView.js';
import {
	actionTarget,
	createBus,
	createRailElements,
	syntheticEvent
} from './MobileHudInputTestDoubles.mjs';

const ACTIVATIONS = 20;

test('every rail control owns twenty pointer sequences and one click action each', () => {
	const bus = createBus();
	const elements = createRailElements();
	const runtime = { runToggle: false };
	const unsubscribeMode = installGameRailModeRuntime(runtime, bus);
	const rail = new MinimalMeadowGameRail(elements.host, bus, {
		initialRunMode: runtime.runToggle
	});
	activateMode(elements.host, runtime);
	activateCollapse(elements.host, rail);
	for (const item of SECONDARY_RAIL_ITEMS) {
		activateEvent(elements.host, bus, item.eventName);
	}
	assert.equal(bus.counts.get('mode:toggle'), ACTIVATIONS);
	assert.equal(bus.counts.get('mode:changed'), ACTIVATIONS);
	assert.equal(runtime.runToggle, false);
	assert.equal(elements.label.textContent, 'Walk');
	assert.equal(rail.diagnostics().input.containedEvents, 400);
	unsubscribeMode();
	rail.destroy();
});

function activateMode(host, runtime) {
	for (let index = 0; index < ACTIVATIONS; index += 1) {
		const before = runtime.runToggle;
		activate(host, actionTarget('mode'));
		assert.equal(runtime.runToggle, !before);
	}
}

function activateCollapse(host, rail) {
	for (let index = 0; index < ACTIVATIONS; index += 1) {
		const before = rail.collapsed;
		activate(host, actionTarget('collapse'));
		assert.equal(rail.collapsed, !before);
	}
	assert.equal(rail.collapsed, false);
}

function activateEvent(host, bus, eventName) {
	for (let index = 0; index < ACTIVATIONS; index += 1) {
		const before = bus.counts.get(eventName) || 0;
		activate(host, actionTarget('event', eventName));
		assert.equal(bus.counts.get(eventName), before + 1);
	}
}

function activate(host, target) {
	const pointerDown = syntheticEvent(target);
	const pointerUp = syntheticEvent(target);
	const click = syntheticEvent(target);
	host.emit('pointerdown', pointerDown);
	host.emit('pointerup', pointerUp);
	host.emit('click', click);
	assert.equal(pointerDown.propagationStops, 1);
	assert.equal(pointerUp.propagationStops, 1);
	assert.equal(click.propagationStops, 1);
}
