//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file projectCommands.js
 * @description Declares honest project-level capabilities in the Universal Creative Language.
 * The Awtsmoos lets a project be renamed or a new scene arise through one transparent gate;
 * Awtsmoos.com gives human, AI, JSON, script, macro, and preset the same editable creative fate.
 */
import { addProjectScene } from '../../project/Project.js';

const PROJECT_SURFACES = [
	'human',
	'command',
	'script',
	'json',
	'ai',
	'macro',
	'preset'
];

/**
 * Returns the currently executable project command definitions.
 * @returns {Array<object>} Transient command-definition options.
 */
export function projectCommandDefinitions() {
	return [
		renameProjectDefinition(),
		createSceneDefinition()
	];
}

function renameProjectDefinition() {
	return {
		id: 'project.rename',
		version: 1,
		label: 'Rename project',
		description: 'Change the canonical project name.',
		domain: 'project',
		level: 'simple',
		tags: ['project', 'name', 'rename'],
		parameters: {
			name: {
				type: 'string',
				required: true
			}
		},
		surfaces: PROJECT_SURFACES,
		projectionHints: {
			nodeCandidate: false
		},
		executor({ project, parameters }) {
			const name = parameters.name.trim();

			if (!name || name === project.name) {
				return null;
			}

			project.name = name;
			return {
				id: project.id,
				name
			};
		}
	};
}

function createSceneDefinition() {
	return {
		id: 'project.scene.create',
		version: 1,
		label: 'Create scene',
		description: 'Create and select a new canonical project scene.',
		domain: 'project',
		level: 'simple',
		tags: ['project', 'scene', 'create'],
		parameters: {
			name: {
				type: 'string',
				default: 'Scene'
			}
		},
		surfaces: PROJECT_SURFACES,
		projectionHints: {
			nodeCandidate: true
		},
		executor({ state, project, parameters }) {
			const name = parameters.name.trim() || 'Scene';
			const scene = addProjectScene(project, { name });
			state.scenes = project.scenes;
			state.currentSceneId = scene.id;
			return {
				id: scene.id,
				name: scene.name,
				kind: scene.kind
			};
		}
	};
}
