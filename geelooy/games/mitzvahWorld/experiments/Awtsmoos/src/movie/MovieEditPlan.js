// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieEditPlan.js
 * @description Normalizes explainable atomic movie-edit plans with warnings, confidence, assets, and revision guard.
 * The Awtsmoos is beyond proposal and execution while each finite agent must reveal its intended path;
 * Awtsmoos.com rejects hidden steps and gives every edit a title, reason, payload, risk, and revision math.
 */

import { MovieApiError } from './MovieApiError.js';
import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';

export const MOVIE_EDIT_PLAN_KIND = 'awtsmoos.movie.edit-plan';
export const MOVIE_EDIT_PLAN_VERSION = 1;

export function createMovieEditPlan(source = {}) {
	const steps = array(source.steps).map((step, index) => normalizeStep(step, index));
	if (!steps.length) {
		throw new MovieApiError('EMPTY_MOVIE_EDIT_PLAN', 'Movie edit plan requires at least one step.');
	}
	if (steps.length > 256) {
		throw new MovieApiError('MOVIE_EDIT_PLAN_TOO_LARGE', 'Movie edit plan supports at most 256 steps.');
	}
	return createMovieProjectSnapshot({
		confidence: bounded(source.confidence, 0, 1, 1),
		expectedRevision: optionalInteger(source.expectedRevision),
		id: String(source.id || `plan-${hashPlan(steps)}`),
		kind: MOVIE_EDIT_PLAN_KIND,
		reason: String(source.reason || 'Apply requested movie edits.'),
		requiredAssets: array(source.requiredAssets).map(String),
		steps,
		title: String(source.title || 'Movie edit plan'),
		version: MOVIE_EDIT_PLAN_VERSION,
		warnings: array(source.warnings).map(String)
	});
}

export function isMovieEditPlan(value) {
	return Boolean(value?.kind === MOVIE_EDIT_PLAN_KIND
		&& Number(value.version) === MOVIE_EDIT_PLAN_VERSION);
}

function normalizeStep(source, index) {
	const action = String(source?.action || 'command');
	if (!['command', 'replaceProject'].includes(action)) {
		throw new MovieApiError('UNKNOWN_MOVIE_EDIT_ACTION', `Unknown edit-plan action ${action}.`);
	}
	return {
		action,
		command: action === 'command' ? String(source.command || '') : null,
		id: String(source.id || `step-${index + 1}`),
		label: String(source.label || source.command || `Step ${index + 1}`),
		payload: source.payload || {},
		project: action === 'replaceProject' ? source.project : null,
		selection: source.selection || null
	};
}

function hashPlan(steps) {
	let hash = 0;
	for (const character of JSON.stringify(steps)) {
		hash = Math.imul(hash ^ character.charCodeAt(0), 2654435761);
	}
	return (hash >>> 0).toString(36);
}

function bounded(value, minimum, maximum, fallback) {
	const number = Number(value);
	return Number.isFinite(number) ? Math.max(minimum, Math.min(maximum, number)) : fallback;
}

function optionalInteger(value) {
	if (value == null) return null;
	const number = Number(value);
	return Number.isFinite(number) ? Math.max(0, Math.floor(number)) : null;
}

function array(value) {
	return Array.isArray(value) ? value : [];
}
