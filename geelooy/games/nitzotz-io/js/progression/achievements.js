// B"H
import { saveGame } from '../save.js';

const ACHIEVEMENTS = [
	achievement('firstLight', 'First Light', world => world.telemetry.captures >= 1),
	achievement('avenueMystic', 'Avenue Mystic', world => (world.consumed.vehicle || 0) >= 8),
	achievement('gardenKeeper', 'Garden Keeper', world => (world.consumed.nature || 0) >= 15),
	achievement('chainBearer', 'Chain Bearer', world => world.telemetry.maxChain >= 20),
	achievement('rivalBreaker', 'Rival Breaker', world => world.telemetry.rivalsEaten >= 1),
	achievement('sealBreaker', 'Seal Breaker', world => world.telemetry.bosses >= 1),
	achievement('cityArchitect', 'City Architect', world => (world.consumed.building || 0) >= 15),
	achievement('metropolis', 'Metropolis', world => world.player.mass >= 1500)
];

export function evaluateAchievements(world) {
	const unlocked = [];
	for (const definition of ACHIEVEMENTS) {
		if (world.save.achievements[definition.id] || !definition.test(world)) continue;
		world.save.achievements[definition.id] = Date.now();
		unlocked.push(definition);
	}
	if (!unlocked.length) return [];
	const latest = unlocked.at(-1);
	world.message = `Achievement: ${latest.name}.`;
	for (const definition of unlocked) world.events.push(['achievement', definition.id]);
	saveGame(world.save);
	return unlocked;
}

export function achievementCount(save) {
	return Object.keys(save.achievements || {}).length;
}

function achievement(id, name, test) {
	return Object.freeze({ id, name, test });
}
