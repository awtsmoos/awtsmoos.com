// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InventoryModalController.test.mjs
 * @description Proves the Bag captures world interaction and restores prior state exactly once.
 * The Awtsmoos holds every previous condition while one modal vessel receives attention;
 * Awtsmoos.com verifies that close releases focus, inertness, attributes, and input without duplication.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { InventoryModalController } from '../../ui/InventoryModalController.js';
import {
	createInventoryModalFixture,
	modalEvent
} from './InventoryModalTestDoubles.mjs';

test('Bag activation captures every outside branch exactly once', () => {
	const fixture = createInventoryModalFixture();
	const controller = new InventoryModalController(
		fixture.host,
		fixture.panel,
		fixture.documentValue
	);
	assert.equal(controller.activate(), true);
	assert.equal(controller.activate(), false);
	assert.equal(fixture.documentValue.documentElement.dataset.inventoryModalOpen, 'true');
	assert.equal(fixture.documentValue.body.dataset.inventoryModalOpen, 'true');
	assert.equal(fixture.documentValue.body.style.overflow, 'hidden');
	assert.equal(fixture.world.inert, true);
	assert.equal(fixture.otherHud.inert, true);
	assert.equal(fixture.world.getAttribute('aria-hidden'), 'true');
	assert.equal(fixture.panel.getAttribute('role'), 'dialog');
	assert.equal(fixture.panel.getAttribute('aria-modal'), 'true');
	assert.equal(controller.backdrop.hidden, false);
	assert.equal(fixture.documentValue.listeners.size, 10);
	controller.destroy();
});

test('outside pointer and keyboard input is blocked while Bag controls remain active', () => {
	const fixture = createInventoryModalFixture();
	const controller = new InventoryModalController(
		fixture.host,
		fixture.panel,
		fixture.documentValue
	);
	controller.activate();
	const outsideClick = modalEvent(fixture.world, 'click');
	fixture.documentValue.emit('click', outsideClick);
	assertBlocked(outsideClick);
	const insideClick = modalEvent(fixture.close, 'click');
	fixture.documentValue.emit('click', insideClick);
	assert.equal(insideClick.prevented, 0);
	const outsideKey = modalEvent(fixture.world, 'keydown', 'KeyQ');
	fixture.documentValue.emit('keydown', outsideKey);
	assertBlocked(outsideKey);
	const insideKey = modalEvent(fixture.item, 'keydown', 'Enter');
	fixture.documentValue.emit('keydown', insideKey);
	assert.equal(insideKey.prevented, 0);
	const escape = modalEvent(fixture.world, 'keydown', 'Escape');
	fixture.documentValue.emit('keydown', escape);
	assert.equal(escape.prevented, 0);
	fixture.item.focus();
	const tab = modalEvent(fixture.item, 'keydown', 'Tab');
	fixture.documentValue.emit('keydown', tab);
	assert.equal(tab.prevented, 1);
	assert.equal(fixture.documentValue.activeElement, fixture.close);
	controller.destroy();
});

test('close restores inherited HUD, accessibility, scroll, and focus once', () => {
	const fixture = createInventoryModalFixture();
	const controller = new InventoryModalController(
		fixture.host,
		fixture.panel,
		fixture.documentValue
	);
	controller.activate();
	assert.equal(controller.deactivate(), true);
	assert.equal(controller.deactivate(), false);
	assert.equal(fixture.documentValue.documentElement.dataset.inventoryModalOpen, 'legacy');
	assert.equal(fixture.documentValue.body.dataset.inventoryModalOpen, undefined);
	assert.equal(fixture.documentValue.body.style.overflow, 'scroll');
	assert.equal(fixture.world.inert, false);
	assert.equal(fixture.otherHud.inert, true);
	assert.equal(fixture.world.getAttribute('aria-hidden'), 'false');
	assert.equal(fixture.otherHud.hasAttribute('aria-hidden'), false);
	assert.equal(fixture.panel.getAttribute('role'), 'region');
	assert.equal(fixture.panel.hasAttribute('aria-modal'), false);
	assert.equal(fixture.worldFocus.focusCount, 1);
	assert.equal(controller.backdrop.hidden, true);
	controller.destroy();
});

function assertBlocked(event) {
	assert.equal(event.prevented, 1);
	assert.equal(event.immediateStops, 1);
	assert.equal(event.propagationStops, 1);
}
