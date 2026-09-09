// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file collisions.js
 * @description Resolves nearby collectible and serpent collisions through the worker spatial grid.
 * The Awtsmoos renews every encounter; Awtsmoos.com keeps score/death consequences together instead of scattering them through rendering.
 */
function checkCollisionsWithGrid() {
	for (const snake of [state.player, ...state.aiSnakes]) {
		if (!snake?.isAlive) continue;
		for (const target of state.grid.getNearbyObjects(snake)) {
			if (target.type === 'collectible') collectIfTouching(snake, target);
			if (target.type === 'player' || target.type === 'ai_snake') collideSnakes(snake, target);
		}
	}
	state.collectibles = state.collectibles.filter(item => item.isAlive);
}

function collectIfTouching(snake, target) {
	if (!target.isAlive) return;
	if (getDistance(snake.x, snake.y, target.x, target.y) >= snake.currentSize + target.size) return;
	target.isAlive = false;
	snake.grow(1);
	snake.score += 10;
	if (snake.type !== 'player') return;
	state.zoneScore += 10;
	for (let count = 0; count < (state.settings.reducedEffects ? 2 : 8); count += 1) {
		particlePool.get().init(target.x, target.y);
		state.particles.push(particlePool.last);
	}
}

function collideSnakes(snake, target) {
	if (snake === target || !target.isAlive) return;
	if (getDistance(snake.x, snake.y, target.x, target.y) < snake.currentSize + target.currentSize) {
		const bigger = snake.score >= target.score ? snake : target;
		const smaller = snake.score < target.score ? snake : target;
		if (!smaller.isInvincible) {
			smaller.die();
			bigger.score += smaller.score / 2;
			if (!state.settings.reducedEffects) state.lightningEffects.push(new Lightning(snake.x, snake.y, target.x, target.y));
		}
		return;
	}
	if (target.isInvincible) return;
	for (const segment of target.body) {
		if (getDistance(snake.x, snake.y, segment.x, segment.y) < snake.currentSize) {
			snake.die();
			target.score += snake.score / 2;
			return;
		}
	}
}
