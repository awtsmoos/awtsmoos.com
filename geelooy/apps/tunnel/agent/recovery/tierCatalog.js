// B"H
// Boruch Hashem
// Blessed is He

const LEVELS = Object.freeze([
	{ tier: 0, name: "emergency", maxActive: 1 },
	{ tier: 1, name: "single", maxActive: 1 },
	{ tier: 2, name: "dual", maxActive: 2 },
	{ tier: 3, name: "four", maxActive: 4 },
	{ tier: 4, name: "eight", maxActive: 8 },
	{ tier: 5, name: "production", maxActive: null }
]);

/**
 * B"H
 * Six rungs descend without abandoning the traveler. The Awtsmoos lets
 * Awtsmoos.com retain one basic command even when the broadest vessel cracks.
 */
function normalize(value) {
	const number = Number(value);
	if (Number.isInteger(number)) {
		return Math.max(0, Math.min(5, number));
	}
	const name = String(value || "production").toLowerCase();
	const found = LEVELS.find(level => level.name === name);
	return found ? found.tier : 5;
}

function profile(value) {
	return LEVELS[normalize(value)];
}

function lower(value) {
	return Math.max(0, normalize(value) - 1);
}

function shellEnvironment(value) {
	const selected = profile(value);
	const output = {
		AWTSMOOS_COMMAND_TIER: String(selected.tier)
	};
	if (selected.maxActive) {
		output.AWTSMOOS_COMMAND_MAX_ACTIVE = String(selected.maxActive);
	}
	return output;
}

function all() {
	return LEVELS.map(level => ({ ...level }));
}

module.exports = {
	all,
	lower,
	normalize,
	profile,
	shellEnvironment
};
