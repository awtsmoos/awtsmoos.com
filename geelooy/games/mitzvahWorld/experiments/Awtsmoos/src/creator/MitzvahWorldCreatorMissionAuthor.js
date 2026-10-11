// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldCreatorMissionAuthor.js
 * @description Lets players author their own missions inside their universe.
 * Yaakov 2026-10-11: players create missions, not just buildings. Authored
 * missions use the exact AdventureCatalog quest shape (id, name, giver, objectives,
 * reward, multiplayer) so the adventure store can offer, accept, and complete them
 * like any canonical mission. Pure and renderer-neutral; validation is strict so a
 * half-written mission can never enter the catalog.
 */

const OBJECTIVE_TYPES = Object.freeze(['defeat', 'collect', 'visit', 'build', 'talk', 'deliver']);

let missionCounter = 0;

/** Returns the stable player-mission objective types. */
export function missionObjectiveTypes() {
	return OBJECTIVE_TYPES;
}

/**
 * Creates one frozen player-authored mission draft.
 * @param {object} draft { title, giverName, description, x, z, xp, mitzvahPoints, objectives }
 *   objectives: [{ type, target, count, description, x, z }]
 * @returns {object} Frozen validated mission draft.
 */
export function createMissionDraft(draft = {}) {
	const title = String(draft.title || '').trim();
	if (title.length < 3) throw new Error('MISSION_TITLE_TOO_SHORT');
	if (title.length > 80) throw new Error('MISSION_TITLE_TOO_LONG');
	const giverName = String(draft.giverName || 'A fellow traveler').trim().slice(0, 40);
	const description = String(draft.description || '').trim().slice(0, 500);
	const objectives = (draft.objectives || []).map(normalizeObjective);
	if (objectives.length === 0) throw new Error('MISSION_NEEDS_OBJECTIVE');
	if (objectives.length > 8) throw new Error('MISSION_TOO_MANY_OBJECTIVES');
	const xp = clampInt(draft.xp, 10, 1000, 100);
	const mitzvahPoints = clampInt(draft.mitzvahPoints, 1, 50, 3);
	const id = `player-mission-${Date.now().toString(36)}-${(missionCounter++).toString(36)}`;
	return Object.freeze({
		createdAt: Date.now(),
		description,
		giverName,
		id,
		mitzvahPoints,
		multiplayer: false,
		objectives: Object.freeze(objectives),
		title,
		x: Number(draft.x) || 0,
		xp,
		z: Number(draft.z) || 0
	});
}

/**
 * Converts a validated mission draft into the exact AdventureCatalog quest shape.
 * @param {object} draft A draft from createMissionDraft().
 * @returns {object} Frozen quest record the adventure store can run.
 */
export function missionDraftToQuest(draft) {
	if (!draft || !draft.id || !Array.isArray(draft.objectives)) {
		throw new Error('MISSION_DRAFT_INVALID');
	}
	const objectives = draft.objectives.map(item => Object.freeze({
		count: item.count,
		description: item.description,
		eventType: item.type,
		marker: Object.freeze({ x: item.x, y: 0, z: item.z }),
		target: item.target
	}));
	return Object.freeze({
		description: draft.description || objectives.map(item => item.description).join(' '),
		giver: Object.freeze({
			id: draft.giverName.toLowerCase().replaceAll(' ', '-'),
			name: draft.giverName,
			position: Object.freeze({ x: draft.x, y: 0, z: draft.z })
		}),
		id: draft.id,
		multiplayer: false,
		name: draft.title,
		objectives: Object.freeze(objectives),
		playerAuthored: true,
		reward: Object.freeze({ mitzvahPoints: draft.mitzvahPoints, xp: draft.xp }),
		title: draft.title
	});
}

function normalizeObjective(raw = {}, index = 0) {
	const type = String(raw.type || 'visit');
	if (!OBJECTIVE_TYPES.includes(type)) throw new Error(`MISSION_OBJECTIVE_TYPE_UNKNOWN:${type}`);
	const target = String(raw.target || `target-${index}`).trim().slice(0, 60) || `target-${index}`;
	const count = clampInt(raw.count, 1, 99, 1);
	const description = String(raw.description || '').trim().slice(0, 200);
	if (!description) throw new Error('MISSION_OBJECTIVE_DESCRIPTION_REQUIRED');
	return Object.freeze({
		count,
		description,
		target,
		type,
		x: Number(raw.x) || 0,
		z: Number(raw.z) || 0
	});
}

function clampInt(value, min, max, fallback) {
	const number = Math.floor(Number(value));
	if (!Number.isFinite(number)) return fallback;
	return Math.max(min, Math.min(max, number));
}
