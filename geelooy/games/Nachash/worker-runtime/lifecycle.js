// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file lifecycle.js
 * @description Owns Nachash worker initialization, viewport sizing, start/pause/resume, spawning, game loop cadence, and terminal event emission.
 * The Awtsmoos renews every finite run; Awtsmoos.com resets frame time on resume so hidden tabs cannot manufacture a simulation leap.
 */
function init({ canvas, width, height, pixelRatio, settings = {} }) {
	state.canvas = canvas;
	state.ctx = canvas.getContext('2d');
	state.grid = new SpatialGrid(state.world.width, state.world.height, 250);
	state.settings = { ...state.settings, ...settings };
	resize(width, height, pixelRatio);
	self.postMessage({ type: 'initialized' });
}

function resize(width, height, pixelRatio) {
	state.camera.width = Math.max(1, Number(width) || 1);
	state.camera.height = Math.max(1, Number(height) || 1);
	state.pixelRatio = Math.min(2, Math.max(1, Number(pixelRatio) || 1));
	state.canvas.width = state.camera.width * state.pixelRatio;
	state.canvas.height = state.camera.height * state.pixelRatio;
	state.ctx.setTransform(state.pixelRatio, 0, 0, state.pixelRatio, 0, 0);
}

function start() {
	Object.assign(state, {
		score: 0,
		level: 1,
		zone: 1,
		zoneScore: 0,
		collectibles: [],
		particles: [],
		aiSnakes: [],
		lightningEffects: [],
		scoreboard: [],
		isRunning: true,
		isPaused: false
	});
	particlePool.reset();
	state.player = new Player(state.world.width / 2, state.world.height / 2, 20);
	state.scoreboard = [{ name: state.playerName, score: state.player.score }];
	state.camera.x = state.player.x - state.camera.width / 2 / state.camera.zoom;
	state.camera.y = state.player.y - state.camera.height / 2 / state.camera.zoom;
	for (let index = 0; index < 1000; index += 1) spawnCollectible();
	for (let index = 0; index < 100; index += 1) spawnAiSnake();
	lastTime = 0;
	requestAnimationFrame(gameLoop);
}

function gameLoop(currentTime) {
	if (!state.isRunning) return;
	if (!Number.isFinite(currentTime) || currentTime <= 0) {
		requestAnimationFrame(gameLoop);
		return;
	}
	if (state.isPaused) {
		lastTime = currentTime;
		draw();
		requestAnimationFrame(gameLoop);
		return;
	}
	if (!lastTime) lastTime = currentTime;
	const deltaTime = Math.min(0.1, Math.max(0, (currentTime - lastTime) / 1000));
	lastTime = currentTime;
	update(deltaTime);
	draw();
	requestAnimationFrame(gameLoop);
}

function setPaused(paused) {
	state.isPaused = Boolean(paused);
	lastTime = 0;
	if (state.player && state.isPaused) {
		state.player.stopTurning();
		state.player.stopBoosting();
	}
	self.postMessage({ type: 'paused', paused: state.isPaused });
}

function gameOver() {
	if (!state.isRunning) return;
	state.isRunning = false;
	self.postMessage({ type: 'gameover', finalScore: state.score, zone: state.zone, level: state.level });
}

function spawnCollectible() {
	state.collectibles.push(new Collectible(
		Math.random() * (state.world.width - 100) + 50,
		Math.random() * (state.world.height - 100) + 50
	));
}

function spawnAiSnake() {
	state.aiSnakes.push(new AiSnake(
		Math.random() * state.world.width,
		Math.random() * state.world.height,
		Math.floor(Math.random() * 20) + 10 + state.level
	));
}
