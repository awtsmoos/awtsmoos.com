// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowRuntimeState.js
 * @description Installs lifecycle, defense, combat arbitration, and safe recovery at boot.
 * The Awtsmoos gives every runtime fact one named vessel; Awtsmoos.com joins health,
 * guard, checkpoint, event truth, and lawful return before deferred challenge begins.
 */
import { PlayerCombatDefense } from '../gameplay/PlayerCombatDefense.js';
import { AwtsmoosEventBus } from '../ui/AwtsmoosEventBus.js';
import { MinimalMeadowCombatBalanceCoordinator } from './MinimalMeadowCombatBalanceCoordinator.js';
import { MinimalMeadowMovementRecovery } from './MinimalMeadowMovementRecovery.js';
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
	runtime.movementRecovery = new MinimalMeadowMovementRecovery(runtime, runtime.state);
	runtime.movementRecovery.checkpoint(runtime.state);
	runtime.playerStats = normalizePlayerStats(runtime.playerStats);
	runtime.playerDefense = new PlayerCombatDefense({
		guardStamina: runtime.playerStats.guardStamina,
		stats: runtime.playerStats
	});
	runtime.canonicalPlayer = { status: 'loading' };
	runtime.runToggle = false;
	runtime.worldMode = 'procedural-combat-meadow';
	runtime.document = documentValue;
	runtime.hosts = hosts;
	runtime.playerDefeatState = createMinimalMeadowPlayerDefeatState(
		runtime.state,
		runtime.playerStats.maxHealth
	);
	runtime.combatBalance = new MinimalMeadowCombatBalanceCoordinator();
	runtime.playerDefeat = new MinimalMeadowPlayerDefeatController(
		runtime,
		documentValue?.defaultView || globalThis
	);
	bindDefenseIntents(runtime);
	return runtime;
}

function bindDefenseIntents(runtime) {
	runtime.bus.on('combat:defense-intent', ({ action }) => {
		const now = runtime.combat?.clock || 0;
		if (action.type === 'block' || action.type === 'parry') {
			runtime.playerDefense.beginGuard(now, {
				blockSeconds: action.activeEnd + action.recovery,
				facing: runtime.state.facing,
				parrySeconds: action.type === 'parry' ? action.activeEnd : 0.12
			});
			runtime.bus.emit('combat:defense-state', runtime.playerDefense.snapshot(now));
		}
	});
	runtime.bus.on('combat:cancel-all', () => {
		runtime.playerDefense.endGuard(runtime.combat?.clock || 0, 0.15);
	});
}

function normalizePlayerStats(stats = {}) {
	return {
		areaResistance: Number(stats.areaResistance) || 0,
		armor: Number(stats.armor) || 3,
		blockStrength: Number(stats.blockStrength) || 0.55,
		face: stats.face || '🎩',
		guardRegeneration: Number(stats.guardRegeneration) || 18,
		guardStamina: Number(stats.guardStamina) || 100,
		health: Number.isFinite(stats.health) ? Math.max(0, stats.health) : 100,
		level: Number(stats.level) || 1,
		maxHealth: Number(stats.maxHealth) || 100,
		maxStamina: Number(stats.maxStamina) || 100,
		name: stats.name || 'Chossid',
		physicalResistance: Number(stats.physicalResistance) || 0,
		rangedResistance: Number(stats.rangedResistance) || 0,
		spiritualResistance: Number(stats.spiritualResistance) || 0,
		stamina: Number.isFinite(stats.stamina) ? Math.max(0, stats.stamina) : 100,
		staminaRegeneration: Number(stats.staminaRegeneration) || 14,
		xp: Number(stats.xp) || 0,
		xpMax: Number(stats.xpMax) || 100
	};
}

export default initializeMinimalMeadowRuntime;
