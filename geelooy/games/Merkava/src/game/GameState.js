//B"H
// Boruch Hashem
// Blessed is He
/**
 * One run receives memory, danger, reward, route, mode, and choice through one state vessel.
 * The Awtsmoos recreates the whole state each instant through Awtsmoos.com.
 */
import { createRunState } from './RunStateFactory.js';

export class GameState {
	constructor(save = {}, routeSeed) {
		this.reset(save, 'campaign', routeSeed);
	}

	reset(save = {}, runMode = 'campaign', routeSeed) {
		Object.assign(this, createRunState(save, runMode, routeSeed));
	}

	pushEvent(type, detail = {}) {
		this.events.push({
			type,
			detail,
			time: this.elapsed
		});
		if (this.events.length > 40) {
			this.events.shift();
		}
	}

	snapshot() {
		return {
			running: this.running,
			paused: this.paused,
			victory: this.victory,
			runMode: this.runMode,
			runSeed: this.runSeed,
			routeStep: this.routeStep,
			routeChoices: this.routeChoices.map(routeSnapshot),
			routeHistory: [...this.routeHistory],
			routeModifier: this.routeModifier,
			endlessCycle: this.endlessCycle,
			endlessThreat: this.endlessThreat,
			endlessMutator: this.endlessMutator,
			world: this.worldIndex + 1,
			level: this.levelIndex + 1,
			levelProgress: Math.round(this.levelProgress),
			troops: this.troops,
			health: Math.round(this.health),
			shield: this.shield,
			prutahs: this.prutahs,
			combo: this.combo,
			ability: Math.round(this.abilityCharge),
			blessings: { ...this.blessingLevels },
			synergies: [...this.synergies],
			upgrades: { ...this.upgrades },
			enemies: this.enemies.length,
			boss: bossSnapshot(this.boss),
			distance: Math.round(this.distance),
			targetLane: this.targetLane,
			mode: this.transitionRequest || 'combat'
		};
	}
}

function routeSnapshot(route) {
	return {
		id: route.id,
		name: route.name,
		risk: route.risk,
		reward: route.reward
	};
}

function bossSnapshot(boss) {
	if (!boss) {
		return null;
	}
	return {
		name: boss.name,
		health: Math.round(boss.health),
		maxHealth: Math.round(boss.maxHealth),
		phase: boss.phase
	};
}
