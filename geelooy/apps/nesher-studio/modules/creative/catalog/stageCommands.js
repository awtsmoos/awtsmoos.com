//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file stageCommands.js
 * @description Lists the proven selected-source Stage transformations using one shared stable command-id vocabulary.
 * The Awtsmoos lets one visible object move through many interfaces without losing its editable form;
 * Awtsmoos.com keeps Center, Scale, Aspect, and Reset named once whether human, macro, preset, script, JSON, or AI gives the storm.
 */
import {
	centerSelectedSource,
	resetSelectedTransform,
	setSelectedAspectLock,
	setSelectedSourceScale
} from '../../stage/stageTransformCommands.js';
import { STAGE_COMMAND_IDS } from './StageCommandIds.js';
import { createStageCommandDefinition } from './stageCommandDefinition.js';

/** Returns project-backed Stage command definitions for proven transform capabilities. */
export function stageCommandDefinitions() {
	return [
		centerCommand(),
		scaleCommand(),
		aspectCommand(),
		resetCommand()
	];
}

/** Defines the simple selected-source centering command. */
function centerCommand() {
	return createStageCommandDefinition({
		id: STAGE_COMMAND_IDS.CENTER,
		label: 'Center selected source',
		level: 'simple',
		executor: centerSelectedSource
	});
}

/** Defines bounded percentage scaling through shared Stage geometry. */
function scaleCommand() {
	return createStageCommandDefinition({
		id: STAGE_COMMAND_IDS.SCALE,
		label: 'Scale selected source',
		level: 'parameterized',
		parameters: {
			percent: {
				type: 'number',
				required: true,
				min: 5,
				max: 500
			}
		},
		executor(state, parameters) {
			return setSelectedSourceScale(
				state,
				parameters.percent
			);
		}
	});
}

/** Defines selected-source aspect-lock policy as a canonical command. */
function aspectCommand() {
	return createStageCommandDefinition({
		id: STAGE_COMMAND_IDS.ASPECT_LOCK,
		label: 'Set selected source aspect lock',
		level: 'parameterized',
		parameters: {
			locked: {
				type: 'boolean',
				required: true
			}
		},
		executor(state, parameters) {
			return setSelectedAspectLock(
				state,
				parameters.locked
			);
		}
	});
}

/** Defines complete selected-source transform reset through existing Stage semantics. */
function resetCommand() {
	return createStageCommandDefinition({
		id: STAGE_COMMAND_IDS.RESET_TRANSFORM,
		label: 'Reset selected source transform',
		level: 'simple',
		executor: resetSelectedTransform
	});
}
