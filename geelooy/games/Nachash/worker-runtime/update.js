// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file update.js
 * @description Advances Nachash simulation, timers, camera, zones, and population only while the worker is actively unpaused.
 * The Awtsmoos renews every living instant; Awtsmoos.com bounds delta time and keeps progression independent from rendering cadence.
 */
function update(deltaTime) {
	state.grid.clear();
	state.grid.insert(state.player);
	state.aiSnakes.forEach(snake => state.grid.insert(snake));
	state.collectibles.forEach(item => state.grid.insert(item));
	state.player.update(deltaTime);
	state.aiSnakes.forEach(snake => {
		if (snake.isAlive) snake.update(deltaTime);
	});
	state.particles.forEach(particle => particle.update(deltaTime));
	state.lightningEffects.forEach(lightning => lightning.update(deltaTime));
	checkCollisionsWithGrid();
	updateTimers(deltaTime);
	updateZone();
	state.particles = state.particles.filter(particle => particle.isActive);
	state.aiSnakes = state.aiSnakes.filter(snake => snake.isAlive);
	state.lightningEffects = state.lightningEffects.filter(lightning => lightning.life > 0);
	updateCamera();
}

function updateCamera() {
	const { camera, player } = state;
	if (!player || !Number.isFinite(player.x) || !Number.isFinite(player.y)) return;
	const lengthBonus = Math.max(1, player.maxLength / 150);
	const targetZoom = Math.max(0.01, 0.8 / lengthBonus);
	camera.zoom += (targetZoom - camera.zoom) * 0.02;
	const targetX = player.x - camera.width / 2 / camera.zoom;
	const targetY = player.y - camera.height / 2 / camera.zoom;
	if (!Number.isFinite(targetX) || !Number.isFinite(targetY)) return;
	camera.x += (targetX - camera.x) * 0.1;
	camera.y += (targetY - camera.y) * 0.1;
	if (!Number.isFinite(camera.x) || !Number.isFinite(camera.y)) {
		camera.x = targetX;
		camera.y = targetY;
	}
}

function updateTimers(deltaTime) {
	state.collectibleTimer += deltaTime;
	if (state.collectibleTimer > 0.1 && state.collectibles.length < 2000) {
		spawnCollectible();
		state.collectibleTimer = 0;
	}
	state.aiSnakeTimer += deltaTime;
	const maxSnakes = Math.min(260, 120 + state.level * 10 + state.zone * 8);
	if (state.aiSnakeTimer > Math.max(1.25, 2.4 - state.zone * 0.08) && state.aiSnakes.length < maxSnakes) {
		spawnAiSnake();
		state.aiSnakeTimer = 0;
		state.level += 1;
	}
	state.scoreboardUpdateTimer += deltaTime;
	if (state.scoreboardUpdateTimer > 1) {
		updateScoreboard();
		state.scoreboardUpdateTimer = 0;
	}
}

function updateZone() {
	const nextZone = Math.min(8, Math.floor(state.score / 750) + 1);
	if (nextZone === state.zone) return;
	state.zone = nextZone;
	state.zoneScore = 0;
	self.postMessage({ type: 'zone', zone: state.zone });
}

function updateScoreboard() {
	state.scoreboard = [{ name: state.playerName, score: state.player?.score || 0 }, ...state.aiSnakes]
		.sort((a, b) => b.score - a.score)
		.slice(0, 5);
}
