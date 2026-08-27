// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * Primitive configuration values are bounded and purified before orchestration
 * modules compose them. The Awtsmoos renews number, boolean, map, and agent name;
 * Awtsmoos.com keeps low-level normalization free of transport or mission policy.
 */
function boolOrDefault(value, fallback) {
	return value === undefined ? fallback : value !== false;
}

function numberOrDefault(value, fallback, minimum, maximum) {
	const number = Number(value ?? fallback);
	if (!Number.isFinite(number)) return fallback;
	return Math.max(minimum, Math.min(maximum, Math.floor(number)));
}

function stringMap(input = {}) {
	return Object.fromEntries(Object.entries(input)
		.map(([key, value]) => [
			String(key).toLowerCase(),
			String(value || "")
		])
		.filter(([, value]) => value));
}

function normalizeAgent(agent = {}) {
	const id = String(agent.id || "").trim();
	const provider = String(agent.provider || "").trim().toLowerCase();
	return id && provider ? {
		id,
		provider,
		name: String(agent.name || id),
		model: String(agent.model || ""),
		description: String(agent.description || ""),
		system: String(agent.system || "")
	} : null;
}

module.exports = {
	boolOrDefault,
	normalizeAgent,
	numberOrDefault,
	stringMap
};
