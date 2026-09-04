//B"H
// Boruch Hashem
// Blessed is He
/**
* @file historyCommands.js
* @description Exposes project-history travel as discoverable commands while runtime source handles cross hydration by stable identity.
* The Awtsmoos renews each instant while memory may reveal a former creative face with living oros restored in place;
* Awtsmoos.com lets human, script, JSON, and AI walk one Undo road without creating history about history's grace.
*/
import { redoProject, undoProject } from '../../project/Project.js';
import { syncStateFromProject } from '../../state.js';
import {
	pruneSourceRuntimeResources,
	rememberSourceRuntimeResources,
	restoreSourceRuntimeResources
} from '../history/SourceRuntimeResourceLedger.js';

const HISTORY_SURFACES = [
	'human',
	'command',
	'script',
	'json',
	'ai'
];

/** Returns first-class history-navigation capabilities for the shared command registry. */
export function historyCommandDefinitions() {
	return [
		historyDefinition('undo'),
		historyDefinition('redo')
	];
}

/** Builds one history command whose availability follows the canonical stack it consumes. */
function historyDefinition(direction) {
	const isUndo = direction === 'undo';
	return {
		id: `history.${direction}`,
		version: 1,
		label: isUndo ? 'Undo' : 'Redo',
		description: `${isUndo ? 'Undo' : 'Redo'} the latest canonical project change.`,
		domain: 'history',
		level: 'simple',
		tags: ['history', direction],
		parameters: {},
		surfaces: HISTORY_SURFACES,
		mutation: 'history',
		projectionHints: {
			nodeCandidate: false
		},
		isAvailable({ state }) {
			const stack = isUndo ? state.project.undo.past : state.project.undo.future;
			return {
				available: stack.length > 0,
				reason: stack.length ? '' : `Nothing to ${direction}.`
			};
		},
		executor({ state, project }) {
			rememberSourceRuntimeResources(state);
			const travel = isUndo ? undoProject : redoProject;
			travel(project);
			syncStateFromProject(state);
			restoreSourceRuntimeResources(state);
			pruneSourceRuntimeResources(state);
			return historyResult(project, direction);
		}
	};
}

/** Returns deterministic evidence without pretending history navigation is a new creative mutation. */
function historyResult(project, direction) {
	return {
		direction,
		projectId: project.id,
		name: project.name,
		pastDepth: project.undo.past.length,
		futureDepth: project.undo.future.length
	};
}
