//B"H
// Boruch Hashem
// Blessed is He
/**
* @file sceneStructureCommands.js
* @description Exposes scene duplication and deletion as transactional commands over one canonical document.
* The Awtsmoos lets a scene branch into a fresh editable vessel or withdraw from the current chain;
* Awtsmoos.com keeps both acts undoable and inspectable, never flattened into an opaque domain.
*/
import {
	deleteProjectScene,
	duplicateProjectScene
} from '../../project/SceneOperations.js';
import { syncStateFromProject } from '../../state.js';
import {
	SCENE_COMMAND_SURFACES,
	sceneIdParameter
} from './sceneCommandSurfaces.js';

/** Returns structural scene commands for the universal registry. */
export function sceneStructureCommandDefinitions() {
	return [
		duplicateSceneDefinition(),
		deleteSceneDefinition()
	];
}

/** Creates a transactional scene copy with fresh descendant source identities. */
function duplicateSceneDefinition() {
	return {
		id: 'project.scene.duplicate',
		version: 1,
		label: 'Duplicate Scene',
		description: 'Create an editable copy of one scene with fresh source identities.',
		domain: 'project',
		level: 'simple',
		tags: ['project', 'scene', 'duplicate'],
		parameters: {
			sceneId: sceneIdParameter()
		},
		surfaces: SCENE_COMMAND_SURFACES,
		executor({ state, project, parameters }) {
			const scene = duplicateProjectScene(project, parameters.sceneId);
			syncStateFromProject(state);
			return {
				id: scene.id,
				name: scene.name,
				sourceIds: [...scene.sourceIds]
			};
		}
	};
}

/** Creates a guarded deletion command that can never remove the project's final scene. */
function deleteSceneDefinition() {
	return {
		id: 'project.scene.delete',
		version: 1,
		label: 'Delete Scene',
		description: 'Remove one scene while preserving a valid surviving scene context.',
		domain: 'project',
		level: 'simple',
		tags: ['project', 'scene', 'delete'],
		parameters: {
			sceneId: sceneIdParameter()
		},
		surfaces: SCENE_COMMAND_SURFACES,
		isAvailable({ state }) {
			return {
				available: state.project.scenes.length > 1,
				reason: state.project.scenes.length > 1
					? ''
					: 'A project must keep at least one scene.'
			};
		},
		executor({ state, project, parameters }) {
			const result = deleteProjectScene(project, parameters.sceneId);
			syncStateFromProject(state);
			return result;
		}
	};
}
