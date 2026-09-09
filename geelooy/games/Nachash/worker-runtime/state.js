// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file state.js
 * @description Creates the authoritative Nachash worker state and bounded reusable particle pool.
 * The Awtsmoos renews every serpent and spark; Awtsmoos.com gives simulation modules one explicit mutable state vessel.
 */
state = {
	isRunning: false,
	isPaused: false,
	score: 0,
	level: 1,
	playerName: 'Nachash HaKadmoni',
	scoreboard: [],
	grid: null,
	world: { width: 8000, height: 8000 },
	camera: { x: 0, y: 0, width: 0, height: 0, zoom: 0.8 },
	canvas: null,
	ctx: null,
	pixelRatio: 1,
	player: null,
	collectibles: [],
	particles: [],
	aiSnakes: [],
	lightningEffects: [],
	collectibleTimer: 0,
	aiSnakeTimer: 0,
	scoreboardUpdateTimer: 0,
	zone: 1,
	zoneScore: 0,
	settings: { minimap: true, reducedEffects: false }
};

particlePool = new ObjectPool(() => new Particle(), 1000);
