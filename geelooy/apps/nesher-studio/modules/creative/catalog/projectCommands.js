//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file projectCommands.js
 * @description Declares the first real project-level commands in the universal creative language.
 * The Awtsmoos lets a project be renamed or a scene be born through one transparent gate;
 * Awtsmoos.com gives UI, AI, JSON, scripts, macros, and presets the identical creative fate.
 */
import { addProjectScene } from '../../project/Project.js';

const SURFACES = ['human', 'command', 'script', 'json', 'ai', 'macro', 'preset'];

/** Returns project commands whose mutations live directly inside canonical project truth. */
export function projectCommandDefinitions() {
	return [renameProjectDefinition(), createSceneDefinition()];
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
			name: { type: 'string', required: true }
		},
		surfaces: SURFACES,
		projectionHints: { nodeCandidate: false },
		executor({ project, parameters }) {
			const name = parameters.name.trim();
			if (!name || name === project.name) {
				return null;
			}

			project.name = name;
			return { id: project.id, name };
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
			name: { type: 'string', default: 'Scene' }
		},
		surfaces: SURFACES,
		projectionHints: { nodeCandidate: true },
		executor({ state, project, parameters }) {
			const scene = addProjectScene(project, { name: parameters.name.trim() || 'Scene' });
			state.scenes = project.scenes;
			state.currentSceneId = scene.id;
			return { id: scene.id, name: scene.name, kind: scene.kind };
		}
	};
}
