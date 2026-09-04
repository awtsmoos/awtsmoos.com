//B"H
// Boruch Hashem
// Blessed is He
/**
* @file sourceSelectionCommands.js
* @description Defines editor-only Stage source selection without creating creative history entries.
* The Awtsmoos lets attention rest upon one source while the document itself remains unchanged;
* Awtsmoos.com gives human and AI the same selection tongue without making undo history strange.
*/
import { getSources } from '../../graph/sceneGraph.js';
import { STAGE_COMMAND_IDS } from './StageCommandIds.js';

const SOURCE_SURFACES = ['human', 'command', 'script', 'json', 'ai', 'macro'];

/** Returns the source-selection command definition. */
export function sourceSelectionCommandDefinition() {
	return {
		id: STAGE_COMMAND_IDS.SELECT_SOURCE,
		version: 1,
		label: 'Select Source',
		description: 'Make one existing Stage source the active editor selection.',
		domain: 'stage',
		level: 'simple',
		tags: ['stage', 'source', 'select'],
		parameters: {
			sourceId: sourceIdParameter()
		},
		surfaces: SOURCE_SURFACES,
		mutation: 'editor',
		isAvailable({ state, parameters }) {
			const available = Boolean(findSource(state, parameters.sourceId));
			return {
				available,
				reason: available ? '' : 'Source is unavailable in the current scene.'
			};
		},
		executor({ state, parameters }) {
			const source = findSource(state, parameters.sourceId);
			state.selectedId = source.id;
			return {
				id: source.id,
				name: source.name,
				type: source.type
			};
		}
	};
}

/** Returns the stable source identity parameter shared by source-list commands. */
export function sourceIdParameter() {
	return {
		type: 'string',
		required: true,
		description: 'Stable Stage source identity.'
	};
}

/** Finds one source by stable identity in the current scene. */
export function findSource(state, sourceId) {
	return getSources(state).find((source) => source.id === sourceId) || null;
}

export { SOURCE_SURFACES };
