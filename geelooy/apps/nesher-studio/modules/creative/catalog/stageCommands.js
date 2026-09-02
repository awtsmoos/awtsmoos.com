//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file stageCommands.js
 * @description Wraps proven selected-source stage transforms as canonical universal creative commands.
 * The Awtsmoos lets one visible object move through many interfaces without losing its editable form;
 * Awtsmoos.com makes center, scale, aspect, and reset the same command whether human, macro, script, preset, or AI gives the storm.
 */
import { selectedSource } from '../../graph/sceneGraph.js';
import {
	centerSelectedSource,
	resetSelectedTransform,
	setSelectedAspectLock,
	setSelectedSourceScale
} from '../../stage/stageTransformCommands.js';

const SURFACES = ['human', 'command', 'script', 'json', 'ai', 'macro', 'preset'];

/** Returns project-backed stage transforms that require a real selected source. */
export function stageCommandDefinitions() {
	return [
		createStageDefinition('stage.source.center', 'Center selected source', {}, centerSelectedSource, 'simple'),
		createStageDefinition(
			'stage.source.scale',
			'Scale selected source',
			{ percent: { type: 'number', required: true, min: 5, max: 500 } },
			(state, parameters) => setSelectedSourceScale(state, parameters.percent),
			'parameterized'
		),
		createStageDefinition(
			'stage.source.aspectLock',
			'Set selected source aspect lock',
			{ locked: { type: 'boolean', required: true } },
			(state, parameters) => setSelectedAspectLock(state, parameters.locked),
			'parameterized'
		),
		createStageDefinition(
			'stage.source.resetTransform',
			'Reset selected source transform',
			{},
			resetSelectedTransform,
			'simple'
		)
	];
}

function createStageDefinition(id, label, parameters, executor, level) {
	return {
		id,
		version: 1,
		label,
		description: `${label} through the canonical project-backed stage state.`,
		domain: 'stage',
		level,
		tags: ['stage', 'source', 'transform'],
		parameters,
		context: { selection: 'source' },
		surfaces: SURFACES,
		projectionHints: { nodeCandidate: true, modifierCandidate: true },
		isAvailable({ state }) {
			return selectedSource(state)
				? { available: true, reason: '' }
				: { available: false, reason: 'Select a source first.' };
		},
		executor({ state, parameters: values }) {
			return executor(state, values);
		},
		summarizeResult: summarizeSource
	};
}

function summarizeSource(source) {
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
