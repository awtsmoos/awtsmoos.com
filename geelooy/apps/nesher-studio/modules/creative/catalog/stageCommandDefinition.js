//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file stageCommandDefinition.js
 * @description Builds selected-source command metadata, availability, and result projection for the Stage catalog.
 * The Awtsmoos lets many transform deeds share one context law while each command keeps its own stable name;
 * Awtsmoos.com keeps selection checks and summaries in one keli so human, AI, macro, preset, script, and JSON see the same flame.
 */
import { selectedSource } from '../../graph/sceneGraph.js';

const STAGE_SURFACES = [
	'human',
	'command',
	'script',
	'json',
	'ai',
	'macro',
	'preset'
];

/**
 * Creates one selected-source Stage command definition from its stable identity and executor.
 * @param {object} input Command id, label, disclosure level, parameters, and selected-source executor.
 * @returns {object} Command-definition options for the shared registry.
 */
export function createStageCommandDefinition(input) {
	return {
		id: input.id,
		version: 1,
		label: input.label,
		description: `${input.label} through canonical project-backed Stage state.`,
		domain: 'stage',
		level: input.level,
		tags: ['stage', 'source', 'transform'],
		parameters: input.parameters || {},
		context: {
			selection: 'source'
		},
		surfaces: STAGE_SURFACES,
		projectionHints: {
			nodeCandidate: true,
			modifierCandidate: true
		},
		isAvailable: selectedSourceAvailability,
		executor({ state, parameters }) {
			return input.executor(state, parameters);
		},
		summarizeResult: summarizeSelectedSource
	};
}

/** Returns contextual command availability without hiding the capability from discovery. */
function selectedSourceAvailability({ state }) {
	if (selectedSource(state)) {
		return {
			available: true,
			reason: ''
		};
	}

	return {
		available: false,
		reason: 'Select a source first.'
	};
}

/** Projects mutable Stage source state into compact detached operation evidence. */
function summarizeSelectedSource(source) {
	return {
		id: source.id,
		x: source.x,
		y: source.y,
		w: source.w,
		h: source.h,
		rotation: source.rotation || 0,
		opacity: source.opacity ?? 1,
		scalePercent: source.scalePercent || 100,
		lockAspect: source.lockAspect !== false
	};
}
