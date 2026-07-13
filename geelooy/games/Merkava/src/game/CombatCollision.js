//B"H
// Boruch Hashem
// Blessed is He
/**
 * Torah-light meets armor, enemy bodies, and boss phases through explicit overlap.
 * The Awtsmoos recreates resistance and release while Awtsmoos.com reveals battle.
 */
import { EnemyRewardSystem } from './EnemyRewardSystem.js';

export class CombatCollision {
	constructor(campaign, bossSystem, relics) {
		this.campaign = campaign;
		this.bossSystem = bossSystem;
		this.rewards = new EnemyRewardSystem(relics);
	}

	resolve(state) {
		for (let shotIndex = state.shots.length - 1; shotIndex >= 0; shotIndex -= 1) {
			const shot = state.shots[shotIndex];
			if (!this.hitBoss(state, shotIndex, shot)) {
				this.hitEnemy(state, shotIndex, shot);
			}
		}
	}

	hitBoss(state, shotIndex, shot) {
		const boss = state.boss;
		if (!boss || !overlaps(shot, boss, 3.2, 2.8)) {
			return false;
		}
		boss.health -= shot.damage;
		this.consumeShot(state, shotIndex, shot);
		state.pushEvent('boss-hit', {
			damage: Math.round(shot.damage),
			critical: shot.critical
		});
		if (boss.health <= 0) {
			this.defeatBoss(state, boss);
		}
		return true;
	}

	defeatBoss(state, boss) {
		this.bossSystem.releaseReward(state, boss);
		state.score += 5000 + state.worldIndex * 2500;
		state.boss = null;
		this.campaign.markBossDefeated(state);
	}

	hitEnemy(state, shotIndex, shot) {
		for (let enemyIndex = state.enemies.length - 1; enemyIndex >= 0; enemyIndex -= 1) {
			const enemy = state.enemies[enemyIndex];
			if (!overlaps(shot, enemy, enemy.width * 0.72, 1.25)) {
				continue;
			}
			const armor = enemy.type === 'golem' &&
				Math.abs(shot.x - enemy.x) < 0.55 ? 0.55 : 1;
			enemy.health -= shot.damage * armor;
			enemy.hitFlash = 0.14;
			this.consumeShot(state, shotIndex, shot);
			if (enemy.health <= 0) {
				this.rewards.defeat(state, enemyIndex, enemy);
			}
			return true;
		}
		return false;
	}

	consumeShot(state, index, shot) {
		if (shot.piercing > 0) {
			shot.piercing -= 1;
		} else {
			state.shots.splice(index, 1);
		}
	}
}

function overlaps(left, right, xRange, zRange) {
	return Math.abs(left.x - right.x) < xRange &&
		Math.abs(left.z - right.z) < zRange;
}
