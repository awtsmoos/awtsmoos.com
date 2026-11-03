// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioDocumentModel.js
 * @description Normalizes the portable `awtsmoos.world.v1` document and every serializable object record.
 * Binah gives structure to raw authoring data while rejecting accidental runtime machinery from the vessel.
 * The Awtsmoos recreates every finite record and the reader beholding it; Awtsmoos.com remembers that source.
 */

export const STUDIO_DOCUMENT_FORMAT = 'awtsmoos.world.v1';

/** @returns {object} Fresh portable world document. */
export function createStudioDocument(name = 'Untitled Mitzvah World') {
	return {
		format: STUDIO_DOCUMENT_FORMAT,
		name: String(name || 'Untitled Mitzvah World'),
		movie: createStudioMovie(),
		objects: [],
		version: 1
	};
}

/** @returns {object} Fresh portable movie slot carried inside the world document. */
export function createStudioMovie() {
	return {
		shotCounter: 0,
		shots: [],
		title: ''
	};
}

/**
 * Validates and normalizes a candidate portable document.
 * @param {object} candidate Parsed document candidate.
 * @returns {object} Normalized world document.
 * @throws {Error} When format or object collection is invalid.
 */
export function normalizeStudioDocument(candidate) {
	if (!candidate || candidate.format !== STUDIO_DOCUMENT_FORMAT) {
		throw new Error(`Expected ${STUDIO_DOCUMENT_FORMAT} document.`);
	}
	if (!Array.isArray(candidate.objects)) {
		throw new Error('Studio document objects must be an array.');
	}
	return {
		format: STUDIO_DOCUMENT_FORMAT,
		name: String(candidate.name || 'Imported Mitzvah World'),
		movie: normalizeStudioMovie(candidate.movie),
		objects: candidate.objects.map(normalizeStudioObject),
		version: 1
	};
}

/**
 * Normalizes the movie slot carried inside the world document.
 * Documents saved before the slot existed simply have no `movie` field;
 * they normalize to an empty movie, so old worlds load exactly as before
 * while the game-side consumer of `awtsmoos.world.v1` may ignore the slot.
 * @param {object} movie Candidate movie slot.
 * @returns {object} Portable normalized movie slot.
 */
export function normalizeStudioMovie(movie = {}) {
	const source = movie && typeof movie === 'object' ? movie : {};
	const shots = Array.isArray(source.shots)
		? source.shots.map(normalizeStudioShot)
		: [];
	const highestSuffix = shots.reduce((highest, shot) => {
		const match = /^shot-(\d+)$/.exec(shot.id);
		return match ? Math.max(highest, Number(match[1])) : highest;
	}, 0);
	return {
		shotCounter: Math.max(
			integer(source.shotCounter),
			highestSuffix
		),
		shots,
		title: String(source.title || '')
	};
}

/** @param {object} shot Candidate shot record. @param {number} index Shot position. @returns {object} Portable normalized shot. */
export function normalizeStudioShot(shot = {}, index = 0) {
	const source = shot && typeof shot === 'object' ? shot : {};
	const dialogue = source.dialogue && typeof source.dialogue === 'object'
		? source.dialogue
		: {};
	const duration = Number(source.durationSec);
	const offset = Number(source.cameraOffset);
	return {
		cameraOffset: Number.isFinite(offset)
			? Math.min(3, Math.max(0.25, offset))
			: 1,
		dialogue: {
			speaker: String(dialogue.speaker || ''),
			text: String(dialogue.text || '')
		},
		durationSec: Number.isFinite(duration) && duration > 0 ? duration : 5,
		id: String(source.id || `shot-${index + 1}`),
		preset: typeof source.preset === 'string' && source.preset.trim() !== ''
			? source.preset
			: 'static',
		targetId: String(source.targetId || ''),
		targetLabel: String(source.targetLabel || ''),
		title: String(source.title || `Shot ${index + 1}`)
	};
}

/** @param {object} object Candidate object. @returns {object} Portable normalized object. */
export function normalizeStudioObject(object = {}) {
	return {
		catalogId: String(object.catalogId || 'unknown'),
		color: String(object.color || '#d7c690'),
		id: String(object.id || ''),
		label: String(object.label || object.catalogId || 'Object'),
		materialRole: String(object.materialRole || 'default'),
		position: vector3(object.position),
		rotation: vector3(object.rotation),
		scale: positiveVector3(object.scale),
		seed: integer(object.seed),
		shape: String(object.shape || 'box'),
		size: positiveVector3(object.size)
	};
}

/** @param {object} documentState Portable document. @returns {object} Deep normalized clone. */
export function cloneStudioDocument(documentState) {
	return normalizeStudioDocument(JSON.parse(JSON.stringify(documentState)));
}

function vector3(value = {}) {
	return {
		x: finite(value.x),
		y: finite(value.y),
		z: finite(value.z)
	};
}

function positiveVector3(value = {}) {
	return {
		x: Math.max(0.05, finite(value.x, 1)),
		y: Math.max(0.05, finite(value.y, 1)),
		z: Math.max(0.05, finite(value.z, 1))
	};
}

function integer(value) {
	return Math.trunc(finite(value));
}

function finite(value, fallback = 0) {
	return Number.isFinite(Number(value)) ? Number(value) : fallback;
}
