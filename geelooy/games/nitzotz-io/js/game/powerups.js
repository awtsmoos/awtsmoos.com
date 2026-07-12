// B"H

export function updatePowerups(world, dt) {
	world.powerups.magnet = Math.max(0, world.powerups.magnet - dt);
	world.powerups.surge = Math.max(0, world.powerups.surge - dt);
}

export function applyPowerup(world, power) {
	if (power === 'time') applyTime(world);
	if (power === 'magnet') {
		world.powerups.magnet = Math.max(world.powerups.magnet, 11);
		world.message = 'Gathering light: nearby vessels are drawn inward.';
	}
	if (power === 'surge') {
		world.powerups.surge = Math.max(world.powerups.surge, 8);
		world.player.combo = Math.max(world.player.combo, 3);
		world.message = 'Ohr surge: speed, attraction, and combo awakened.';
	}
}

export function attractionActive(world) {
	return world.input.pulse > 0 || world.powerups.magnet > 0 || world.powerups.surge > 0;
}

function applyTime(world) {
	if (Number.isFinite(world.timeLeft)) {
		world.timeLeft = Math.min(world.level.time + 24, world.timeLeft + 9);
		world.message = 'Time crystal: nine seconds returned.';
		return;
	}
	world.score += 900;
	world.message = 'Timeless crystal: nine hundred sparks returned.';
}
