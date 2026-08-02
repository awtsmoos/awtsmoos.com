// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCoreMechanicComposition.js
 * @description Creates and advances core mechanics, controller input, and first-ready accessibility.
 * The Awtsmoos joins escape, attention, recovery, gathering, impact, memory, hand, and mercy;
 * Awtsmoos.com keeps creation, delta-aware update order, snapshots, and teardown bounded.
 */

import { MinimalMeadowCoreMechanicControls } from '../ui/MinimalMeadowCoreMechanicControls.js';
import { MinimalMeadowAccessibilityRuntime } from './MinimalMeadowAccessibilityRuntime.js';
import { MinimalMeadowCombatImpactRuntime } from './MinimalMeadowCombatImpactRuntime.js';
import { MinimalMeadowConsumableRuntime } from './MinimalMeadowConsumableRuntime.js';
import { MinimalMeadowDodgeRuntime } from './MinimalMeadowDodgeRuntime.js';
import { MinimalMeadowGamepadRuntime } from './MinimalMeadowGamepadRuntime.js';
import { MinimalMeadowLockOnRuntime } from './MinimalMeadowLockOnRuntime.js';
import { MinimalMeadowLootDropRuntime } from './MinimalMeadowLootDropRuntime.js';

export function createMinimalMeadowCoreMechanics(runtime, environment) {
	const documentValue = environment.document || runtime.document;
	return {
		accessibility: new MinimalMeadowAccessibilityRuntime(
			runtime,
			documentValue,
			environment
		),
		combatImpact: new MinimalMeadowCombatImpactRuntime(runtime, environment),
		consumables: new MinimalMeadowConsumableRuntime(runtime, environment),
		controls: new MinimalMeadowCoreMechanicControls(runtime, documentValue),
		dodge: new MinimalMeadowDodgeRuntime(runtime, environment),
		gamepad: new MinimalMeadowGamepadRuntime(runtime, environment),
		lockOn: new MinimalMeadowLockOnRuntime(runtime),
		loot: new MinimalMeadowLootDropRuntime(runtime),
		persistence: null
	};
}

export function updateMinimalMeadowCoreMechanics(mechanics, deltaSeconds) {
	mechanics.gamepad.update(deltaSeconds, false);
	mechanics.dodge.update(deltaSeconds);
	mechanics.lockOn.update(deltaSeconds);
	mechanics.consumables.update(deltaSeconds);
	mechanics.loot.update(deltaSeconds);
	mechanics.persistence?.update(deltaSeconds);
	mechanics.controls.refresh();
}

export function destroyMinimalMeadowCoreMechanics(mechanics) {
	mechanics.persistence?.destroy();
	mechanics.controls.destroy();
	mechanics.loot.destroy();
	mechanics.lockOn.destroy();
	mechanics.gamepad.destroy();
	mechanics.consumables.destroy();
	mechanics.dodge.destroy();
	mechanics.combatImpact.destroy();
	mechanics.accessibility.destroy();
}

export function snapshotMinimalMeadowCoreMechanics(mechanics) {
	return Object.freeze({
		accessibility: mechanics.accessibility.snapshot(),
		combatImpact: mechanics.combatImpact.snapshot(),
		consumables: mechanics.consumables.snapshot(),
		dodge: mechanics.dodge.snapshot(),
		gamepad: mechanics.gamepad.snapshot(),
		lockOn: mechanics.lockOn.snapshot(),
		loot: mechanics.loot.snapshot(),
		persistence: mechanics.persistence?.snapshot?.() || null
	});
}
