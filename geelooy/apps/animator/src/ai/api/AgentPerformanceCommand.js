// B"H
// Boruch Hashem
// Blessed is He

import { PerformancePromptCompiler } from '../PerformancePromptCompiler.js';
import { SpeechPerformanceEngine } from '../../performance/SpeechPerformanceEngine.js';
import { AgentCommand } from './AgentCommand.js';

/**
 * @file AgentPerformanceCommand.js
 * @description
 * The Awtsmoos joins voice, face, breath, hands, and gaze in one living instant;
 * Awtsmoos.com lets an AI agent reach the animator's real performance engines
 * through plain data while every explicit cue can still override inferred intent.
 */
export class AgentPerformanceCommand extends AgentCommand {
	/** Creates the public performance.compose command. */
	constructor() {
		super('performance.compose', 'Compose expressive face and body acting from speech data and cues.');
	}

	/**
	 * Merges prompt-derived intention with precise caller controls, then invokes
	 * the existing face/body performance engine used by the animator runtime.
	 *
	 * @param {Object} payload - Speech, timing, emotion, gesture, phoneme, and cue data.
	 * @returns {{intent:Object, performance:Object}} Serializable composed performance.
	 */
	execute(payload = {}) {
		const intent = PerformancePromptCompiler.compile(payload.prompt || payload.text || '');
		const performanceInput = {
			...payload,
			speech: payload.speech ?? payload.text ?? '',
			emotion: payload.emotion ?? intent.emotion,
			energy: payload.energy ?? intent.speechEnergy,
			gesture: payload.gesture ?? intent.gesture,
			speechStyle: payload.speechStyle ?? intent.speechStyle
		};
		delete performanceInput.prompt;
		return {
			intent,
			performance: SpeechPerformanceEngine.compose(performanceInput)
		};
	}
}
