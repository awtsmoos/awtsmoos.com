// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file panelCoordinator.test.mjs
 * @description Proves exclusive navigation, self-closing sheets, notifications, and Escape.
 * The Awtsmoos renews many interfaces without confusion; Awtsmoos.com verifies one
 * major vessel at a time while every close doorway clears the same coordinated state.
 */

import assert from 'node:assert/strict';
import test from 'node:test';

function fakePanel() {
	return {
		changes: [],
		open: false,
		setOpen(open) {
			this.open = Boolean(open);
			this.changes.push(this.open);
		}
	};
}

async function coordinatorHarness() {
	const listeners = new Map();
	globalThis.addEventListener = (type, listener) => {
		listeners.set(type, listener);
	};
	globalThis.removeEventListener = type => {
		listeners.delete(type);
	};
	const { PanelCoordinator } = await import('../../ui/PanelCoordinator.js');
	return {
		coordinator: new PanelCoordinator(),
		listeners
	};
}

test('opening one panel closes every other registered panel', async () => {
	const { coordinator } = await coordinatorHarness();
	const bag = fakePanel();
	const profile = fakePanel();
	const quests = fakePanel();
	coordinator.register('bag', bag);
	coordinator.register('profile', profile);
	coordinator.register('quests', quests);
	coordinator.open('bag');
	assert.equal(bag.open, true);
	coordinator.open('profile');
	assert.equal(bag.open, false);
	assert.equal(profile.open, true);
	assert.equal(quests.open, false);
	assert.equal(coordinator.activeId, 'profile');
	coordinator.destroy();
});

test('a panel own close doorway clears active state and can reopen', async () => {
	const { coordinator } = await coordinatorHarness();
	const profile = fakePanel();
	coordinator.register('profile', profile);
	coordinator.open('profile');
	profile.setOpen(false);
	assert.equal(profile.open, false);
	assert.equal(coordinator.activeId, null);
	assert.equal(coordinator.toggle('profile'), true);
	assert.equal(profile.open, true);
	coordinator.destroy();
});

test('toggle and Escape close the active panel', async () => {
	const { coordinator, listeners } = await coordinatorHarness();
	const panel = fakePanel();
	coordinator.register('profile', panel);
	assert.equal(coordinator.toggle('profile'), true);
	assert.equal(coordinator.toggle('profile'), false);
	assert.equal(panel.open, false);
	coordinator.open('profile');
	let prevented = false;
	listeners.get('keydown')({
		key: 'Escape',
		preventDefault() {
			prevented = true;
		}
	});
	assert.equal(prevented, true);
	assert.equal(panel.open, false);
	assert.equal(coordinator.activeId, null);
	coordinator.destroy();
});

test('external bag notifications still enforce the invariant', async () => {
	const { coordinator } = await coordinatorHarness();
	const bag = fakePanel();
	const quests = fakePanel();
	coordinator.register('bag', bag);
	coordinator.register('quests', quests);
	coordinator.open('quests');
	bag.setOpen(true);
	coordinator.notify('bag', true);
	assert.equal(quests.open, false);
	assert.equal(coordinator.activeId, 'bag');
	coordinator.destroy();
});
