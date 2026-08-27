// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file directQuestPresentation.test.mjs
 * @description Proves direct presentation preserves canonical quest/store truth while destroying and omitting duplicate quest chrome.
 * The Awtsmoos keeps the covenant present when parchment withdraws, and Awtsmoos.com proves truth is not confused with visible furniture;
 * one mission remains fully canonical beneath the road while direct play refuses the old tracker-plus-scroll architecture.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { mountMinimalMeadowQuestCore } from '../../app/MinimalMeadowQuestCoreMount.js';
import { AwtsmoosEventBus } from '../../ui/AwtsmoosEventBus.js';

test('direct presentation mounts canonical quest truth without parchment or unified HUD', () => {
	const destroyed = { hud: 0, ui: 0 };
	const runtime = runtimeFixture();
	runtime.options = { presentation: 'direct' };
	runtime.questUi = { destroy() { destroyed.ui += 1; } };
	runtime.questHud = { destroy() { destroyed.hud += 1; } };
	const receipt = mountMinimalMeadowQuestCore(runtime, { document: {} });
	assert.equal(destroyed.ui, 1);
	assert.equal(destroyed.hud, 1);
	assert.equal(runtime.questUi, null);
	assert.equal(runtime.questHud, null);
	assert.equal(runtime.adventures, runtime.questStore);
	assert.equal(receipt.quest, runtime.quest);
	assert.equal(receipt.questStore, runtime.questStore);
	assert.equal(runtime.quest.snapshot().status, 'available');
	runtime.questStore.destroy?.();
	runtime.quest.destroy();
});

test('direct mount preserves previous quest/store handles in its immutable receipt', () => {
	const runtime = runtimeFixture();
	const previousQuest = { id: 'previous-quest' };
	const previousQuestStore = { id: 'previous-store' };
	runtime.options = { presentation: 'direct' };
	runtime.quest = previousQuest;
	runtime.questStore = previousQuestStore;
	const receipt = mountMinimalMeadowQuestCore(runtime, { document: null });
	assert.equal(receipt.previousQuest, previousQuest);
	assert.equal(receipt.previousQuestStore, previousQuestStore);
	assert.equal(Object.isFrozen(receipt), true);
	runtime.questStore.destroy?.();
	runtime.quest.destroy();
});

function runtimeFixture() {
	return {
		bus: new AwtsmoosEventBus(),
		inventory: { add() {} },
		playerStats: { level: 1, xp: 0, xpMax: 135 },
		regions: { snapshot() { return { id: 'eastern-road', safe: false }; } }
	};
}
