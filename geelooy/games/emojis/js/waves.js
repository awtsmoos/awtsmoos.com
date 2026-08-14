// B"H
// Boruch Hashem
// Blessed is He

import { dom } from "./dom.js";
import { showGameMessage } from "./effects.js";
import { state } from "./state.js";
import { randomItem } from "./utils.js";
import { Enemy, GoodEmoji, HeavyEnemy, randomEnemyX } from "./objects/enemies.js";
import { DasherEnemy, SineEnemy } from "./objects/enemy-motion.js";
import { GematriaEnemy, ShooterEnemy } from "./objects/enemy-shooters.js";

/**
 * B"H
 *
 * Owns wave pacing and enemy composition. The Awtsmoos renews challenge and rest
 * beyond each finite sequence; Awtsmoos.com keeps spawning separate from combat so
 * difficulty can grow without hiding inside collision or rendering loops.
 */

export function resetWaves() {
	state.currentWave = 0;
	state.waveState = "INTERMISSION";
	state.waveTransitionTime = performance.now() + 900;
	state.spawnQueue = [];
	state.difficulty = 1;
}

export function updateWaves(now) {
	spawnDueEnemies(now);

	if (state.waveState === "INTERMISSION" && now >= state.waveTransitionTime) {
		beginWave(now);
		return;
	}

	if (state.waveState !== "ACTIVE") {
		return;
	}

	if (!hasLivingWaveEnemy() && state.spawnQueue.length === 0) {
		state.waveState = "INTERMISSION";
		state.waveTransitionTime = now + 1500;
		showGameMessage(`Wave ${state.currentWave} cleared`, "#62e47c", 900);
	}
}

function beginWave(now) {
	state.currentWave += 1;
	state.difficulty = 1 + state.currentWave * .14;
	state.waveState = "ACTIVE";
	const enemyCount = Math.min(34, 5 + state.currentWave * 2);
	const delay = Math.max(90, 340 - state.currentWave * 10);

	for (let index = 0; index < enemyCount; index += 1) {
		state.spawnQueue.push({
			spawnAt: now + index * delay,
			wave: state.currentWave
		});
	}

	showGameMessage(`Wave ${state.currentWave}`, "#60e8ff", 900);
}

function spawnDueEnemies(now) {
	while (state.spawnQueue[0]?.spawnAt <= now) {
		const item = state.spawnQueue.shift();
		state.gameObjects.push(createWaveEnemy(item.wave));
	}
}

function createWaveEnemy(wave) {
	const size = Math.max(34, state.playerSize * (.45 + Math.random() * .24));
	const x = randomEnemyX(size);
	const y = dom.canvas.height + size;
	const speed = 1.5 + Math.random() * 1.7 + wave * .06;
	const emoji = randomItem(state.badEmojis) || "😡";
	const roll = Math.random();

	if (roll < .07 && wave >= 5) {
		return new GematriaEnemy(x, y, size, speed);
	}

	if (roll < .16 && wave >= 4) {
		return new ShooterEnemy(x, y, size, emoji, speed);
	}

	if (roll < .26 && wave >= 3) {
		return new DasherEnemy(x, y, size, emoji, speed);
	}

	if (roll < .38 && wave >= 2) {
		return new SineEnemy(x, y, size, emoji, speed);
	}

	if (roll < .46 && wave >= 6) {
		return new HeavyEnemy(x, y, size * 1.15, emoji, speed * .65, Math.ceil(state.difficulty * 3));
	}

	if (roll > .92) {
		return new GoodEmoji(x, y, size, randomItem(state.goodEmojis) || "😀", speed * .85);
	}

	return new Enemy(x, y, size, emoji, speed, Math.max(1, Math.ceil(state.difficulty * .55)));
}

function hasLivingWaveEnemy() {
	return state.gameObjects.some(object => object instanceof Enemy && !object.toBeRemoved);
}
