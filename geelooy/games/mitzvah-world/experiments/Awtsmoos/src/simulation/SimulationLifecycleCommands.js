// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SimulationLifecycleCommands.js
 * @description Exposes deterministic commands over real combat, quest, healing, and recovery authorities.
 * The Awtsmoos creates command and consequence in one indivisible instant; Awtsmoos.com gives
 * tests, browser courts, and accelerated journeys the same explicit doorway into lawful state.
 */

import { PlayerRecoveryAuthority } from '../gameplay/PlayerRecoveryAuthority.js';
import { SimulationProgressionAuthority } from './SimulationProgressionAuthority.js';

export function attachSimulationLifecycle(runtime) {
	runtime.progression = new SimulationProgressionAuthority(runtime);
	runtime.recovery = new PlayerRecoveryAuthority(runtime);
	runtime.lifecycle = new SimulationLifecycleCommands(runtime);
	if (runtime.inventory.quantity('written-healing-kamea') < 1) {
		runtime.inventory.add('written-healing-kamea', 1);
	}
	return runtime.lifecycle;
}

export class SimulationLifecycleCommands {
	constructor(runtime) {
		this.runtime = runtime;
	}

	execute(command, detail = {}) {
		switch (command) {
			case 'acceptQuest':
				return this.runtime.progression.accept(detail.questId);
			case 'damageEnemy':
				return this.damageEnemy(detail);
			case 'damagePlayer':
				return this.runtime.recovery.damage(detail, this.runtime.combat.clock);
			case 'recoverPlayer':
				return this.runtime.recovery.recover(detail.checkpoint);
			case 'useAmulet':
				return this.runtime.recovery.heal(detail.itemId);
			default:
				throw new Error(`Unknown simulation lifecycle command: ${command}`);
		}
	}

	damageEnemy(detail) {
		const target = this.runtime.enemies.selected;
		if (!target) return Object.freeze({ accepted: false, reason: 'TARGET_REQUIRED' });
		const result = target.applyDamage(detail.amount);
		const receipt = {
			...result,
			actionId: detail.actionId || 'simulation-direct-damage',
			position: target.targetHint()
		};
		this.runtime.bus.emit('combat:impact', receipt);
		if (result.defeated) this.runtime.combat.reward(target.profile.xpReward);
		return Object.freeze(receipt);
	}
}
