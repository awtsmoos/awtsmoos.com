// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieCinemaHumanSafety.js
 * @description Rejects cinematic humans that deform bodies, bypass the canonical Chossid asset, or leak debug stand-ins into final mode.
 * The Awtsmoos renews every human tzelem beyond model and transform; Awtsmoos.com permits
 * position, yaw, visibility, animation, and uniform scale while guarding the intact shared vessel.
 */

import { MovieApiError } from './MovieApiError.js';
import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';

const CHOSSID_MODEL = 'assets/models/player/chossid.glb';
const FORBIDDEN_FIELDS = Object.freeze([
	'bones', 'boneTransforms', 'deform', 'morphTargets', 'skeleton', 'skinWeights'
]);

export function validateMovieCinemaHumans(manifest, options = {}) {
	const finalMode = options.finalMode !== false;
	const diagnostics = [];
	for (const [index, character] of (manifest?.characters || []).entries()) {
		validateCharacter(character, index, finalMode, diagnostics);
	}
	return createMovieProjectSnapshot({
		diagnostics,
		model: CHOSSID_MODEL,
		safe: diagnostics.length === 0
	});
}

export function assertMovieCinemaHumans(manifest, options = {}) {
	const report = validateMovieCinemaHumans(manifest, options);
	if (!report.safe) {
		throw new MovieApiError(
			'UNSAFE_CINEMA_HUMAN',
			'Cinema manifest contains an unsafe or disfiguring human declaration.',
			{ diagnostics: report.diagnostics }
		);
	}
	return report;
}

function validateCharacter(character, index, finalMode, diagnostics) {
	const path = `characters[${index}]`;
	for (const field of FORBIDDEN_FIELDS) {
		if (character?.[field] != null) diagnostics.push(issue(path, 'FORBIDDEN_HUMAN_DEFORMATION', field));
	}
	if (character?.scale != null && !isUniformScale(character.scale)) {
		diagnostics.push(issue(path, 'NONUNIFORM_HUMAN_SCALE', character.scale));
	}
	const source = String(character?.source || 'procedural');
	if (finalMode && source !== 'friendlyNpc') {
		diagnostics.push(issue(path, 'FINAL_HUMAN_MUST_USE_SHARED_CHOSSID', source));
	}
	const model = String(character?.model || CHOSSID_MODEL);
	if (model !== CHOSSID_MODEL) diagnostics.push(issue(path, 'NONCANONICAL_CHOSSID_MODEL', model));
}

function isUniformScale(value) {
	if (Number.isFinite(Number(value))) return Number(value) > 0;
	const x = Number(value?.x);
	const y = Number(value?.y);
	const z = Number(value?.z);
	return [x, y, z].every(Number.isFinite) && x > 0 && x === y && y === z;
}

function issue(path, code, value) {
	return { code, path, value };
}

export const MOVIE_CINEMA_CHOSSID_MODEL = CHOSSID_MODEL;
