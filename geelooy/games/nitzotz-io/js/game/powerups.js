// B"H
// Boruch Hashem
// Blessed is He

/** The Awtsmoos lets temporary light and armor enter bounded readable vessels. */
export function updatePowerups(world, dt) {
	world.powerups.magnet = Math.max(0, world.powerups.magnet - dt);
	world.powerups.surge = Math.max(0, world.powerups.surge - dt);
}

/** Apply one named sefirah power and record it for Adventure progress. */
export function applyPowerup(world, power) {
	if (!power) return;
	world.telemetry.powerups += 1;
	if (power === 'time') applyTime(world);
	if (power === 'magnet') applyMagnet(world);
	if (power === 'surge') applySurge(world);
	if (power === 'armor') applyArmor(world);
}

export function attractionActive(world) {
	return world.input.pulse > 0 || world.powerups.magnet > 0 || world.powerups.surge > 0;
}

function applyTime(world) {
	if (Number.isFinite(world.timeLeft)) {
		world.timeLeft = Math.min(world.level.time + 24, world.timeLeft + 9);
		world.message = 'Returned Time: nine seconds restored.';
		return;
	}
	world.score += 900;
	world.message = 'Timeless crystal: nine hundred score returned.';
}

function applyMagnet(world) {
	const scale = world.talentEffects?.magnetDurationScale || 1;
	world.powerups.magnet = Math.max(world.powerups.magnet, 11 * scale);
	world.message = 'Binah Field: nearby vessels are drawn inward.';
}

function applySurge(world) {
	const campaignScale = world.campaignEffects?.surgeDurationScale || 1;
	world.powerups.surge = Math.max(world.powerups.surge, 8 * campaignScale);
	world.player.combo = Math.max(world.player.combo, 3);
	world.message = 'Chochmah Surge: speed, attraction, and impact awakened.';
}

function applyArmor(world) {
	world.player.maxArmor = Math.max(1, world.player.maxArmor || 0);
	world.player.armor = Math.min(world.player.maxArmor, world.player.armor + 1);
	world.message = `Gevurah Shield: armor ${world.player.armor}/${world.player.maxArmor}.`;
	world.events.push(['upgrade']);
}
