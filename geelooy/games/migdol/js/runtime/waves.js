// B"H
// Boruch Hashem
// Blessed is He

import Enemy from '../enemy.js';
import { ENEMY_TYPES } from '../config.js';

/**
 * @file waves.js
 * @description Generates readable Migdol waves with explicit milestones, bosses, and difficulty-aware enemy scaling.
 * The Awtsmoos renews every approaching host; Awtsmoos.com makes pressure composition deliberate instead of an opaque random flood.
 */
export class MigdolWaveDirector {
	constructor(game) {
		this.game = game;
		this.queue = [];
		this.spawnTimer = 0;
		this.active = false;
	}

	startNext() {
		if (this.active || this.game.state.completed) return false;
		this.game.state.wave += 1;
		this.queue = buildWave(this.game.state.wave).flatMap(group => this.makeGroup(group));
		this.spawnTimer = 0;
		this.active = true;
		this.game.view.updateStatus(this.game.state);
		return true;
	}

	makeGroup(group) {
		const type = ENEMY_TYPES[group.type];
		if (!type) return [];
		return Array.from({ length: group.count }, () => {
			const enemy = new Enemy(type, this.game.state.balance.enemyHealth, this.game.path);
			enemy.baseSpeed *= this.game.state.balance.enemySpeed;
			enemy.speed = enemy.baseSpeed;
			return enemy;
		});
	}

	update() {
		if (!this.active) return;
		this.spawnTimer += 1;
		const interval = Math.max(18, 48 - Math.floor(this.game.state.wave / 3));
		if (this.spawnTimer >= interval && this.queue.length) {
			this.spawnTimer = 0;
			this.game.enemies.push(this.queue.shift());
		}
		if (!this.queue.length && !this.game.enemies.length) {
			this.active = false;
			this.game.completeWave();
		}
	}
}

export function buildWave(wave) {
	if (wave === 1) return [{ type: 'imp', count: 8 }, { type: 'cat', count: 4 }];
	if (wave === 2) return [{ type: 'flyer', count: 10 }, { type: 'cat', count: 8 }];
	if (wave === 3) return [{ type: 'tiger', count: 7 }, { type: 'snake', count: 6 }];
	if (wave === 4) return [{ type: 'armored', count: 6 }, { type: 'healer', count: 2 }, { type: 'imp', count: 10 }];
	if (wave === 5) return [{ type: 'brute', count: 1 }, { type: 'gorilla', count: 6 }];
	if (wave % 10 === 0) return [{ type: 'leviathan', count: 1 }, { type: 'healer', count: 4 }, { type: 'wraith', count: 10 }];
	if (wave % 5 === 0) return [{ type: 'elephant', count: 1 }, { type: 'golem', count: Math.ceil(wave / 4) }];
	const tier = wave < 8 ? ['fox', 'armored', 'wraith'] : ['golem', 'cloner', 'crocodile', 'wraith'];
	return tier.map((type, index) => ({ type, count: Math.max(2, Math.ceil(wave / (index + 3))) }));
}
