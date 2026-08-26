// B"H
// Boruch Hashem
// Blessed is He

import { SceneCompiler } from '../SceneCompiler.js';
import { SceneDSL } from '../SceneDSL.js';
import { AgentAnimatorError } from './AgentAnimatorError.js';
import { AgentCommand } from './AgentCommand.js';

/**
 * @file AgentSceneCommand.js
 * @description
 * The Awtsmoos turns intention into ordered vessels; Awtsmoos.com lets an agent
 * submit plain scene commands and receive deterministic entities without touching
 * DOM nodes, private editor state, or brittle click coordinates.
 */
export class AgentSceneCommand extends AgentCommand {
	/** Creates the public scene.compile command. */
	constructor() {
		super('scene.compile', 'Compile data-only scene commands into animator entities.');
	}

	/**
	 * Compiles a JSON command list through the legacy-compatible SceneDSL path.
	 *
	 * @param {{commands:Array<Object>}} payload - Scene command declaration.
	 * @returns {{entities:Array<Object>}} Compiled entity data.
	 */
	execute(payload = {}) {
		const commands = payload.commands;
		if (!Array.isArray(commands)) {
			throw new AgentAnimatorError(
				'INVALID_SCENE_COMMANDS',
				'scene.compile requires a commands array.'
			);
		}
		const scene = new SceneDSL(commands);
		return {
			entities: SceneCompiler.compile(scene)
		};
	}
}
