//B"H
// Boruch Hashem
// Blessed is He
/**
 * A boss is warnings, safe lanes, phases, summons, and release rather than extra health.
 * The Awtsmoos is beyond opposition while Awtsmoos.com reveals the finite battle.
 */
import { GAME } from '../config/gameConfig.js';
import { scaleEndlessReward } from '../modes/EndlessRules.js';
import { isEndlessMode } from '../modes/RunModeCatalog.js';
import { bossPhase } from './GameRules.js';
import { createEnemy, createEnemyShot, createPrutah, createWarning } from './EntityFactory.js';

export class BossSystem {
	update(state, delta) {
		const boss = state.boss;
		if (!boss) {
			return;
		}
		boss.phase = bossPhase(boss.health, boss.maxHealth, boss.thresholds);
		boss.z = Math.min(-24, boss.z + state.speed * 0.25 * delta);
		boss.x = Math.sin(state.elapsed * (0.7 + boss.phase * 0.1)) * 2.7;
		boss.attackClock -= delta;
		boss.warningClock = Math.max(0, boss.warningClock - delta);
		this.resolveWarnings(state, boss, delta);
		if (boss.attackClock <= 0) {
			this.warnAttack(state, boss);
		}
	}

	warnAttack(state, boss) {
		const safeLane = (boss.phase + Math.floor(state.elapsed)) % 3;
		for (let lane = 0; lane < 3; lane += 1) {
			if (lane === safeLane) {
				continue;
			}
			const warning = createWarning(
				lane,
				0.9,
				boss.phase >= 3 ? 'beam' : 'strike'
			);
			warning.source = 'boss';
			state.warnings.push(warning);
		}
		boss.warningClock = 0.9;
		const baseDelay = Math.max(1.15, 2.7 - boss.phase * 0.35);
		const endlessCadence = isEndlessMode(state) ?
			state.endlessBossCadenceMultiplier || 1 : 1;
		boss.attackClock = Math.max(0.82, baseDelay * endlessCadence);
		state.pushEvent('boss-warning', { phase: boss.phase, safeLane });
	}

	resolveWarnings(state, boss, delta) {
		for (const warning of state.warnings) {
			if (warning.source !== 'boss') {
				continue;
			}
			warning.duration -= delta;
			if (warning.duration <= 0 && !warning.resolved) {
				warning.resolved = true;
				state.enemyShots.push(createEnemyShot(
					warning.lane,
					boss.z + 4,
					7 + boss.phase * 2
				));
			}
		}
		state.warnings = state.warnings.filter(warning => {
			return warning.source !== 'boss' || warning.duration > -0.4;
		});
		if (boss.phase >= 2 && state.enemies.length < 5) {
			this.trySummon(state, boss);
		}
	}

	trySummon(state, boss) {
		const marker = Math.floor(state.elapsed);
		if (marker % 4 !== 0 || boss.lastSummon === marker) {
			return;
		}
		boss.lastSummon = marker;
		const type = boss.worldIndex >= 3 ? 'elite' :
			boss.worldIndex >= 2 ? 'corrupter' : 'golem';
		state.enemies.push(createEnemy(
			type,
			marker % 3,
			boss.z + 5,
			5 + boss.worldIndex * 4 + (state.endlessDepthBonus || 0)
		));
		state.pushEvent('boss-summon', { type });
	}

	releaseReward(state, boss) {
		if (boss.rewardReleased) {
			return 0;
		}
		boss.rewardReleased = true;
		const baseReward = 30 + boss.worldIndex * 15;
		const immediateReward = isEndlessMode(state) ?
			scaleEndlessReward(state, baseReward) : baseReward;
		state.prutahs += immediateReward;
		state.score += immediateReward * 20;
		for (let index = 0; index < 18; index += 1) {
			state.prutahItems.push(createPrutah(
				index % 3,
				-15 - index * 1.6,
				index % 6 === 0
			));
		}
		state.blessing = 0;
		state.blessingFragments = 0;
		state.abilityCharge = GAME.abilityThreshold;
		state.pushEvent('boss-reward', { prutahs: immediateReward });
		return immediateReward;
	}
}
