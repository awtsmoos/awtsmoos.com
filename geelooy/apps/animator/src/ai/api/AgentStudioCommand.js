// B"H
// Boruch Hashem
// Blessed is He

import { StudioPromptDirector } from '../../studio/StudioPromptDirector.js';
import { AgentAnimatorError } from './AgentAnimatorError.js';
import { AgentCommand } from './AgentCommand.js';

/**
 * @file AgentStudioCommand.js
 * @description
 * The Awtsmoos lets a sentence unfold into actors, dialogue, camera, props, and
 * editable timing; Awtsmoos.com exposes that existing Studio revelation through
 * one data command so agents inherit the real production pipeline, not a toy copy.
 */
export class AgentStudioCommand extends AgentCommand {
	/** Creates the public studio.generate command. */
	constructor() {
		super('studio.generate', 'Generate an editable Studio document from a prompt and base document.');
	}

	/**
	 * Invokes the production Studio prompt director against caller-owned document data.
	 *
	 * @param {{prompt:string, baseDocument:Object}} payload - Prompt generation request.
	 * @returns {Object} Generated editable Studio document.
	 */
	execute(payload = {}) {
		const prompt = String(payload.prompt || '').trim();
		if (!prompt) {
			throw new AgentAnimatorError('EMPTY_PROMPT', 'studio.generate requires a non-empty prompt.');
		}
		if (!payload.baseDocument || typeof payload.baseDocument !== 'object') {
			throw new AgentAnimatorError(
				'MISSING_BASE_DOCUMENT',
				'studio.generate requires a baseDocument object.'
			);
		}
		return StudioPromptDirector.generate(prompt, payload.baseDocument);
	}
}
