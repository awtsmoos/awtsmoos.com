//B"H
// Boruch Hashem
// Blessed is He
/**
* @file sourceLifecycleCommands.js
* @description Defines universal duplicate and history-safe remove commands for current-scene Stage sources.
* The Awtsmoos lets one source become two or depart from sight while stable commands preserve the creative decree;
* Awtsmoos.com keeps stream duplication unavailable and lets Undo guard living resources until history sets them free.
*/
import {
	canDuplicateCollectionSource,
	detachCollectionSource,
	duplicateCollectionSource
} from '../operations/SourceCollectionLifecycle.js';
import {
	findCollectionSource,
	sourceOrderIds
} from '../operations/SourceCollectionState.js';
import { STAGE_COMMAND_IDS } from './StageCommandIds.js';
import {
	sourceIdParameter,
	SOURCE_SURFACES
} from './sourceSelectionCommands.js';

/** Returns source lifecycle commands shared by human, API, JSON, AI, and macro operators. */
export function sourceLifecycleCommandDefinitions() {
	return [
		duplicateDefinition(),
		removeDefinition()
	];
}

/** Builds the non-stream duplicate command with fresh stable identity. */
function duplicateDefinition() {
	return {
		id: STAGE_COMMAND_IDS.DUPLICATE_SOURCE,
		version: 1,
		label: 'Duplicate Source',
		description: 'Duplicate one non-stream Stage source with fresh identity and offset geometry.',
		domain: 'stage',
		level: 'simple',
		tags: ['stage', 'source', 'duplicate'],
		parameters: {
			sourceId: sourceIdParameter()
		},
		surfaces: SOURCE_SURFACES,
		mutation: 'canonical',
		isAvailable({ state, parameters }) {
			const available = canDuplicateCollectionSource(state, parameters.sourceId);
			return {
				available,
				reason: available ? '' : 'Choose a non-stream source to duplicate.'
			};
		},
		executor({ state, parameters }) {
			const copy = duplicateCollectionSource(state, parameters.sourceId);
			return {
				id: copy.id,
				name: copy.name,
				sourceId: parameters.sourceId,
				order: sourceOrderIds(state)
			};
		}
	};
}

/** Builds the Undo-safe detach command; irreversible cleanup remains history-reachability driven. */
function removeDefinition() {
	return {
		id: STAGE_COMMAND_IDS.REMOVE_SOURCE,
		version: 1,
		label: 'Remove Source',
		description: 'Remove one Stage source while retained history protects any restorable runtime resources.',
		domain: 'stage',
		level: 'simple',
		tags: ['stage', 'source', 'remove'],
		parameters: {
			sourceId: sourceIdParameter()
		},
		surfaces: SOURCE_SURFACES,
		mutation: 'canonical',
		isAvailable({ state, parameters }) {
			const available = Boolean(findCollectionSource(state, parameters.sourceId));
			return {
				available,
				reason: available ? '' : 'Source is unavailable in the current scene.'
			};
		},
		executor({ state, parameters }) {
			const removed = detachCollectionSource(state, parameters.sourceId);
			return {
				id: removed.id,
				name: removed.name,
				selectedId: state.selectedId,
				order: sourceOrderIds(state)
			};
		}
	};
}
