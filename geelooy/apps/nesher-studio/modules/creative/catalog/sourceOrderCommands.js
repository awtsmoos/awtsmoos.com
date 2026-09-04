//B"H
// Boruch Hashem
// Blessed is He
/**
* @file sourceOrderCommands.js
* @description Defines transactional before-target source ordering through the canonical collection operation.
* The Awtsmoos lets one layer enter immediately before another while memory records the creative decree;
* Awtsmoos.com keeps visible source objects and sourceIds synchronized for every operator through one command tree.
*/
import {
	canReorderSourceBefore,
	reorderSourceBefore
} from '../operations/SourceCollectionOrdering.js';
import { sourceOrderIds } from '../operations/SourceCollectionState.js';
import { STAGE_COMMAND_IDS } from './StageCommandIds.js';
import {
	sourceIdParameter,
	SOURCE_SURFACES
} from './sourceSelectionCommands.js';

/** Returns the canonical source-reorder command definition. */
export function sourceOrderCommandDefinition() {
	return {
		id: STAGE_COMMAND_IDS.REORDER_SOURCE,
		version: 1,
		label: 'Reorder Source',
		description: 'Move one Stage source immediately before another source in layer order.',
		domain: 'stage',
		level: 'simple',
		tags: ['stage', 'source', 'layer', 'reorder'],
		parameters: {
			sourceId: sourceIdParameter(),
			targetId: {
				type: 'string',
				required: true,
				description: 'Stable target source identity.'
			}
		},
		surfaces: SOURCE_SURFACES,
		mutation: 'canonical',
		isAvailable({ state, parameters }) {
			const available = canReorderSourceBefore(
				state,
				parameters.sourceId,
				parameters.targetId
			);
			return {
				available,
				reason: available ? '' : 'Distinct sources are required and the requested order must change.'
			};
		},
		executor({ state, parameters }) {
			reorderSourceBefore(state, parameters.sourceId, parameters.targetId);
			return {
				sourceId: parameters.sourceId,
				targetId: parameters.targetId,
				order: sourceOrderIds(state)
			};
		}
	};
}
