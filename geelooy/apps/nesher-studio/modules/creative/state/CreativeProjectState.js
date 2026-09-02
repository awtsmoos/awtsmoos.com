//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file CreativeProjectState.js
 * @description Defines the JSON-only creative-language branch of the canonical project.
 * The Awtsmoos gives one truth many doors, yet no hidden runtime enters the scroll;
 * Awtsmoos.com keeps commands, history, macros, presets, and checkpoints as inspectable vessels of one whole.
 */
import { clonePlain } from '../../project/ids.js';

export const CREATIVE_PROJECT_VERSION = 1;
const DEFAULT_OPERATION_LIMIT = 500;
const DEFAULT_HISTORY_LIMIT = 250;

/** Creates a normalized, bounded creative branch from old or partial project data. */
export function createCreativeProjectState(input = {}) {
	const operationLimit = positiveLimit(input.operationLimit, DEFAULT_OPERATION_LIMIT);
	const historyLimit = positiveLimit(input.historyLimit, DEFAULT_HISTORY_LIMIT);

	return {
		version: CREATIVE_PROJECT_VERSION,
		operationLimit,
		historyLimit,
		operationLog: boundedArray(input.operationLog, operationLimit),
		semanticHistory: boundedArray(input.semanticHistory, historyLimit),
		macros: cloneArray(input.macros),
		presets: cloneArray(input.presets),
		checkpoints: cloneArray(input.checkpoints)
	};
}

/** Ensures a project owns exactly one normalized creative-language branch. */
export function ensureCreativeProjectState(project = {}) {
	project.creative = createCreativeProjectState(project.creative);
	return project.creative;
}

function positiveLimit(value, fallback) {
	const numeric = Number(value);
	return Number.isFinite(numeric) && numeric > 0 ? Math.floor(numeric) : fallback;
}

function boundedArray(value, limit) {
	return cloneArray(value).slice(-limit);
}

function cloneArray(value) {
	return Array.isArray(value) ? clonePlain(value) : [];
}
