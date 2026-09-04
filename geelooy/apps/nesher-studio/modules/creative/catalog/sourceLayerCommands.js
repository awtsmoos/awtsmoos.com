//B"H
// Boruch Hashem
// Blessed is He
/**
* @file sourceLayerCommands.js
* @description Defines transactional top, up, down, and bottom layer moves through one canonical ordering operation.
* The Awtsmoos lets every layer climb or descend through stable command names shared by human and machine;
* Awtsmoos.com keeps unavailable edge motion out of history while every successful order preserves the same identity chain.
*/
import {
	canMoveSourceLayer,
	moveSourceLayer
} from '../operations/SourceCollectionOrdering.js';
import { sourceOrderIds } from '../operations/SourceCollectionState.js';
import { STAGE_COMMAND_IDS } from './StageCommandIds.js';
import {
	sourceIdParameter,
	SOURCE_SURFACES
} from './sourceSelectionCommands.js';

const LAYER_COMMANDS = [
	[STAGE_COMMAND_IDS.LAYER_TOP, 'top', 'Move Source to Top'],
	[STAGE_COMMAND_IDS.LAYER_UP, 'up', 'Move Source Up'],
	[STAGE_COMMAND_IDS.LAYER_DOWN, 'down', 'Move Source Down'],
	[STAGE_COMMAND_IDS.LAYER_BOTTOM, 'bottom', 'Move Source to Bottom']
];

/** Returns every canonical source layer-movement command. */
export function sourceLayerCommandDefinitions() {
	return LAYER_COMMANDS.map(([id, direction, label]) => layerDefinition(id, direction, label));
}

/** Builds one layer command whose availability rejects edge no-ops before a transaction begins. */
function layerDefinition(id, direction, label) {
	return {
		id,
		version: 1,
		label,
		description: `${label} in the current Stage layer order.`,
		domain: 'stage',
		level: 'simple',
		tags: ['stage', 'source', 'layer', direction],
		parameters: {
			sourceId: sourceIdParameter()
		},
		surfaces: SOURCE_SURFACES,
		mutation: 'canonical',
		isAvailable({ state, parameters }) {
			const available = canMoveSourceLayer(state, parameters.sourceId, direction);
			return {
				available,
				reason: available ? '' : `Source cannot move ${direction} from its current layer.`
			};
		},
		executor({ state, parameters }) {
			moveSourceLayer(state, parameters.sourceId, direction);
			return {
				sourceId: parameters.sourceId,
				direction,
				order: sourceOrderIds(state)
			};
		}
	};
}
