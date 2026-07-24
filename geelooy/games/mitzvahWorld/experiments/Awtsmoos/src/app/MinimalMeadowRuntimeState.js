// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowRuntimeState.js
 * @description Installs authoritative player lifecycle and shared combat arbitration at boot.
 * The Awtsmoos gives every runtime fact one named vessel; Awtsmoos.com joins checkpoint,
 * health, event truth, and hostile spacing before the deferred world may begin its challenge.
 */

import { AwtsmoosEventBus } from '../ui/AwtsmoosEventBus.js';
import { MinimalMeadowCombatBalanceCoordinator } from './MinimalMeadowCombatBalanceCoordinator.js';
import { MinimalMeadowPlayerDefeatController } from './MinimalMeadowPlayerDefeatController.js';
import { createMinimalMeadowPlayerDefeatState } from './MinimalMeadowPlayerDefeatState.js';

export function initializeMinimalMeadowRuntime(runtime, hosts, documentValue) {
	const ground = runtime.terrain.heightAt(0, 0);
	Object.assign(runtime.state, {
		groundY: ground,
		renderY: ground,
		travelFacing: runtime.state.facing,
		y: ground
	});
	runtime.model.position.set(0, ground, 0);
	runtime.bus = new AwtsmoosEventBus();
	runtime.playerStats = normalizePlayerStats(runtime.playerStats);
	runtime.canonicalPlayer = { status: 'loading' };
	runtime.runToggle = false;
	runtime.worldMode = 'procedural-combat-meadow';
	runtime.document = documentValue;
	runtime.hosts = hosts;
	runtime.playerDefeatState = createMinimalMeadowPlayerDefeatState(runtime.state, runtime.playerStats.maxHealth);
	runtime.combatBalance = new MinimalMeadowCombatBalanceCoordinator();
	runtime.playerDefeat = new MinimalMeadowPlayerDefeatController(
		runtime,
		documentValue?.defaultView || globalThis
	);
	return runtime;
}

function normalizePlayerStats(stats = {}) {
	return {
		armor: Number(stats.armor) || 3,
		face: stats.face || '🎩',
		health: Number.isFinite(stats.health) ? Math.max(0, stats.health) : 100,
		level: Number(stats.level) || 1,
		maxHealth: Number(stats.maxHealth) || 100,
		name: stats.name || 'Chossid',
		xp: Number(stats.xp) || 0,
		xpMax: Number(stats.xpMax) || 100
	};
}

export default initializeMinimalMeadowRuntime;
