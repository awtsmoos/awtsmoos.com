//B"H
// Boruch Hashem
// Blessed is He
/**
* @file sceneSelectionCommands.js
* @description Exposes scene selection and naming through stable commands over canonical project state.
* The Awtsmoos lets a maker point toward one scene and call it by a clearer name;
* Awtsmoos.com lets AI and human hands perform those acts through the very same flame.
*/
import {
	renameProjectScene,
	selectProjectScene
} from '../../project/SceneOperations.js';
import { syncStateFromProject } from '../../state.js';
import {
	SCENE_COMMAND_SURFACES,
	sceneIdParameter
} from './sceneCommandSurfaces.js';

/** Returns context-oriented scene commands for the universal registry. */
export function sceneSelectionCommandDefinitions() {
	return [
		selectSceneDefinition(),
		renameSceneDefinition()
	];
}

/** Creates the non-history navigation command for entering an existing scene. */
function selectSceneDefinition() {
	return {
		id: 'project.scene.select',
		version: 1,
		label: 'Select Scene',
		description: 'Make one existing scene the current editing context.',
		domain: 'project',
		level: 'simple',
		tags: ['project', 'scene', 'select'],
		parameters: {
			sceneId: sceneIdParameter()
		},
		surfaces: SCENE_COMMAND_SURFACES,
		mutation: 'editor',
		projectionHints: {
			nodeCandidate: false
		},
		executor({ state, project, parameters }) {
			const scene = selectProjectScene(project, parameters.sceneId);
			syncStateFromProject(state);
			return sceneEvidence(scene, project);
		}
	};
}

/** Creates the canonical scene-name mutation without replacing scene identity. */
function renameSceneDefinition() {
	return {
		id: 'project.scene.rename',
		version: 1,
		label: 'Rename Scene',
		description: 'Change a scene name while preserving its identity and contents.',
		domain: 'project',
		level: 'simple',
		tags: ['project', 'scene', 'rename'],
		parameters: {
			sceneId: sceneIdParameter(),
			name: {
				type: 'string',
				required: true
			}
		},
		surfaces: SCENE_COMMAND_SURFACES,
		executor({ state, project, parameters }) {
			const scene = renameProjectScene(project, parameters.sceneId, parameters.name);
			syncStateFromProject(state);
			return sceneEvidence(scene, project);
		}
	};
}

/** Returns deterministic public evidence rather than leaking mutable project internals. */
function sceneEvidence(scene, project) {
	return {
		id: scene.id,
		name: scene.name,
		currentSceneId: project.currentSceneId
	};
}
