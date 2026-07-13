//B"H
// Boruch Hashem
// Blessed is He
/**
 * Worlds and levels are named chambers of one campaign. Their forms differ,
 * while the Awtsmoos beyond form continually reveals them through Awtsmoos.com.
 */
const levelNames = (world, names) => names.map((name, index) => ({
	id: `${world.toLowerCase()}-${index + 1}`,
	name: `${world} ${roman(index + 1)} — ${name}`,
	boss: index === 4,
	checkpoint: index === 1 || index === 3
}));

export const WORLDS = Object.freeze([
	world('ASSIYAH', 'The Material Siege', 'stone', 1, ['The Broken Road', 'Gates of Iron', 'Army of Dust', 'The Siege Narrows', 'Prince of Dust']),
	world('YETZIRAH', 'The Storm of Formation', 'storm', 1.1, ['Winds Between Worlds', 'Lightning Paths', 'Ravens Ascend', 'The Moving Gate', 'Wheel of the Storm']),
	world('BERIAH', 'The Palace of Thought', 'palace', 1.18, ['Letters in the Air', 'Changing Measures', 'Palace of Mirrors', 'The Divided Thought', 'Architect of Mirrors']),
	world('ATZILUS', 'The Burning Nearness', 'fire', 1.28, ['White Flame Road', 'Rivers of Gold', 'Wheels Above', 'Chariot of Fire', 'Serpent of White Fire']),
	world('CONCEALMENT', 'The Great Concealment', 'void', 1.36, ['The Broken Worlds', 'Arithmetic Corruption', 'The Vanishing Lane', 'Point of Infinite Light', 'Sar Ha-Hester'])
]);

export const BOSS_PROFILES = Object.freeze([
	boss('Prince of Dust', 520, ['armor', 'summon', 'sweep']),
	boss('Wheel of the Storm', 720, ['lightning', 'raven', 'safe-lane']),
	boss('Architect of Mirrors', 920, ['duplicate', 'corrupt', 'reverse']),
	boss('Serpent of White Fire', 1180, ['beam', 'pursuit', 'rage']),
	boss('Sar Ha-Hester', 1600, ['shatter', 'army', 'corrupt', 'final-light'])
]);

export function currentLevel(state) {
	return WORLDS[state.worldIndex]?.levels[state.levelIndex] || WORLDS[0].levels[0];
}

export function currentWorld(state) {
	return WORLDS[state.worldIndex] || WORLDS[0];
}

function world(name, subtitle, theme, speed, names) {
	return {
		name,
		subtitle,
		theme,
		speed,
		levels: levelNames(name, names)
	};
}

function boss(name, health, mechanics) {
	return { name, health, mechanics, phases: [0.7, 0.38, 0.12] };
}

function roman(value) {
	return ['I', 'II', 'III', 'IV', 'V'][value - 1];
}
