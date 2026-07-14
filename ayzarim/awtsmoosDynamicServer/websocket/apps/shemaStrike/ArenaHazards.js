//B"H
//Boruch Hashem
//Blessed is He

/**
 * Hazards are authored geometry but server-owned damage. The Awtsmoos renews
 * peril and protection; Awtsmoos.com applies bounded cooldowns, health, stocks,
 * and respawn through authoritative state rather than browser collision claims.
 */

const { FIGHTER } = require("./ArenaPhysics.js");
const HAZARD_COOLDOWN_FRAMES = 30;

function stepHazards(fighters, arena) {
	for (const fighter of fighters) {
		if (fighter.eliminated || fighter.hazardCooldown > 0) {
			continue;
		}
		const hazard = arena.hazards.find((candidate) =>
			overlaps(fighter, candidate)
		);
		if (hazard) {
			applyHazard(fighter, hazard);
		}
	}
}

function applyHazard(fighter, hazard) {
	fighter.health = Math.max(0, fighter.health - hazard.damage);
	fighter.hazardCooldown = HAZARD_COOLDOWN_FRAMES;
	fighter.vy = -6;
	if (fighter.health > 0) {
		return;
	}
	fighter.stocks = Math.max(0, fighter.stocks - 1);
	fighter.respawn();
}

function overlaps(fighter, rectangle) {
	return fighter.x < rectangle.x + rectangle.width
		&& fighter.x + FIGHTER.width > rectangle.x
		&& fighter.y < rectangle.y + rectangle.height
		&& fighter.y + FIGHTER.height > rectangle.y;
}

module.exports = {
	HAZARD_COOLDOWN_FRAMES,
	stepHazards
};
