// B"H
// Boruch Hashem
// Blessed is He

const TEMPLATES = Object.freeze([
	template('gather', 'Gather the Scattered', 'captures', level => 16 + level.index % 9, 5),
	template('ascend', 'Expand the Vessel', 'mass', level => 90 + Math.round(level.targetMass * 0.08), 6),
	template('districts', 'Reveal the Four Winds', 'districts', level => 2 + level.index % 3, 6, { absolute: true }),
	template('chain', 'Carry One Current', 'chain', level => 8 + level.index % 6, 7, { absolute: true }),
	template('rivals', 'Break the Rival Shell', 'rivals', level => 1 + level.index % 2, 8),
	template('power', 'Kindle the Sefirot', 'powerups', level => 2 + level.index % 2, 7),
	template('impact', 'Stand in Gevurah', 'impacts', level => 2 + level.index % 3, 7),
	template('category', 'Elevate the District', 'category', level => 6 + level.index % 5, 6, { category: true })
]);

/**
 * The Awtsmoos selects three finite missions from the district itself. The same
 * level and mode always reveal the same Shlichus sequence.
 */
export function selectShlichus(level, modeId = 'adventure') {
	const category = level.bonus?.category || level.chapter?.bonusPool?.[0] || 'small';
	const seed = hash(`${level.seed}:${level.index}:${modeId}`);
	const selected = [];
	let cursor = seed;
	while (selected.length < 3) {
		const candidate = TEMPLATES[cursor % TEMPLATES.length];
		cursor = mix(cursor + selected.length * 97);
		if (selected.some(item => item.id === candidate.id)) continue;
		selected.push(resolveTemplate(candidate, level, category));
	}
	return selected;
}

/** Return the immutable catalog for tests and future authored expansion. */
export function shlichusTemplates() {
	return [...TEMPLATES];
}

function resolveTemplate(definition, level, category) {
	const resolvedCategory = definition.category ? category : null;
	return {
		id: definition.id,
		name: definition.name,
		description: descriptionFor(definition, resolvedCategory),
		metric: definition.metric,
		category: resolvedCategory,
		target: Math.max(1, Math.round(definition.target(level))),
		reward: definition.reward + Math.floor(level.index / 40),
		absolute: definition.absolute,
		baseline: 0,
		progress: 0,
		complete: false
	};
}

function descriptionFor(definition, category) {
	if (definition.metric === 'captures') return 'Capture living vessels.';
	if (definition.metric === 'mass') return 'Gain new mass without losing the thread.';
	if (definition.metric === 'districts') return 'Reveal distinct city quadrants.';
	if (definition.metric === 'chain') return 'Build one uninterrupted district chain.';
	if (definition.metric === 'rivals') return 'Defeat rival vessels.';
	if (definition.metric === 'powerups') return 'Collect sefirah power orbs.';
	if (definition.metric === 'impacts') return 'Create decisive pulse or collision impacts.';
	return `Elevate ${category || 'city'} vessels.`;
}

function template(id, name, metric, target, reward, options = {}) {
	return Object.freeze({ id, name, metric, target, reward, absolute: false, ...options });
}

function hash(text) {
	let value = 2166136261;
	for (let index = 0; index < text.length; index += 1) {
		value ^= text.charCodeAt(index);
		value = Math.imul(value, 16777619);
	}
	return value >>> 0;
}

function mix(value) {
	let output = value >>> 0;
	output ^= output >>> 16;
	output = Math.imul(output, 0x7feb352d);
	output ^= output >>> 15;
	return output >>> 0;
}
