// B"H
// Boruch Hashem
// Blessed is He
import { ITEMS } from '../levels/items.js';
import { isMechanicId, isMechanicProfile } from '../mechanics/catalog.js';

const BONUS_CATEGORIES = new Set([
	'small',
	'street',
	'nature',
	'botanical',
	'vehicle',
	'building',
	'landmark'
]);
const NEWLINE = String.fromCharCode(10);

/**
 * Awtsmoos.com refuses to let a beautiful but impossible district enter runtime.
 * Mechanic identity and authored profile integrity now join reachability evidence.
 */
export function assertCampaignCatalog(levels, chapters) {
	const errors = [];
	if (levels.length !== 200) errors.push(`Expected 200 levels, received ${levels.length}.`);
	if (chapters.length !== 10) errors.push(`Expected 10 chapters, received ${chapters.length}.`);
	const ids = new Set();
	const keys = new Set();
	for (const level of levels) validateLevel(level, ids, keys, errors);
	for (let index = 0; index < chapters.length; index += 1) {
		const count = levels.filter(level => level.chapterIndex === index).length;
		if (count !== 20) errors.push(`Chapter ${index + 1} contains ${count} levels.`);
	}
	const malchusProfiles = levels
		.filter(level => level.chapterIndex === 0)
		.map(level => level.mechanicProfile.id);
	if (new Set(malchusProfiles).size !== 20) errors.push('Malchus requires twenty unique mechanic profiles.');
	if (errors.length) throw new Error(['Campaign validation failed:', ...errors.slice(0, 20)].join(NEWLINE));
	return Object.freeze({ levelCount: levels.length, chapterCount: chapters.length, malchusProfiles: 20 });
}

export function estimateAvailableMass(level) {
	const entries = Object.entries(level.weights);
	const knownEntries = entries.filter(([kind]) => ITEMS[kind]);
	const totalWeight = knownEntries.reduce((sum, [, weight]) => sum + weight, 0);
	const weightedMass = knownEntries.reduce((sum, [kind, weight]) => sum + ITEMS[kind].mass * weight, 0);
	const averageMass = weightedMass / Math.max(1, totalWeight);
	return Math.round(25 + averageMass * 210 * level.density + 2600);
}

function validateLevel(level, ids, keys, errors) {
	if (ids.has(level.id)) errors.push(`Duplicate id ${level.id}.`);
	if (keys.has(level.key)) errors.push(`Duplicate key ${level.key}.`);
	ids.add(level.id);
	keys.add(level.key);
	if (!Number.isInteger(level.globalIndex) || level.globalIndex < 0 || level.globalIndex > 199) errors.push(`Invalid index for ${level.key}.`);
	if (!BONUS_CATEGORIES.has(level.bonus.category)) errors.push(`Invalid bonus category for ${level.key}.`);
	if (!isMechanicId(level.mechanic)) errors.push(`Invalid mechanic for ${level.key}.`);
	if (!isMechanicProfile(level.mechanicProfile)) errors.push(`Invalid mechanic profile for ${level.key}.`);
	if (level.mechanicProfile?.mechanic !== level.mechanic) errors.push(`Mechanic profile mismatch for ${level.key}.`);
	if (level.bounds < 1600 || level.bounds > 4600) errors.push(`Bounds outside envelope for ${level.key}.`);
	if (level.density < 0.75 || level.density > 1.35) errors.push(`Density outside envelope for ${level.key}.`);
	if (level.rivals < 0 || level.rivals > 10) errors.push(`Rival count outside envelope for ${level.key}.`);
	const kinds = Object.keys(level.weights);
	const unknownKinds = kinds.filter(kind => !ITEMS[kind]);
	for (const kind of unknownKinds) errors.push(`Unknown item ${kind} in ${level.key}.`);
	if (!unknownKinds.length && (level.targetMass <= 25 || level.targetMass >= estimateAvailableMass(level))) errors.push(`Unreachable target for ${level.key}.`);
	if (!kinds.some(kind => ITEMS[kind]?.r <= 15)) errors.push(`No safe opening item in ${level.key}.`);
}
