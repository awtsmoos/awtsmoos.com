//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file macroReuseCommand.js
 * @description Defines creation of an editable macro from successful semantic history as one ordinary canonical Creative Language command.
 * The Awtsmoos lets remembered deeds braid into one reusable river without losing the stones that made its flow;
 * Awtsmoos.com keeps macro creation commandable and inspectable, so human, AI, JSON, and script share what they know.
 */
import { REUSE_COMMAND_IDS } from './ReuseCommandIds.js';

/**
 * Creates the registered macro-from-history command definition.
 * @param {Array<string>} surfaces Explicit supported operator surfaces.
 * @returns {object} Command-definition options.
 */
export function macroReuseCommandDefinition(surfaces) {
	return {
		id: REUSE_COMMAND_IDS.CREATE_MACRO_FROM_HISTORY,
		version: 1,
		label: 'Create macro from history',
		description: 'Turn successful creative operations into an editable reusable macro.',
		domain: 'creative',
		level: 'parameterized',
		tags: ['macro', 'history', 'reuse', 'workflow'],
		parameters: {
			name: {
				type: 'string',
				required: true
			},
			fromIndex: {
				type: 'number',
				default: 0,
				min: 0
			},
			toIndex: {
				type: 'number',
				min: 0
			}
		},
		surfaces,
		projectionHints: {
			nodeCandidate: true
		},
		executor({ parameters, services }) {
			return services.macroStore.createFromHistory(
				parameters.name,
				parameters.fromIndex,
				parameters.toIndex
			);
		},
		summarizeResult(macro) {
			return {
				id: macro.id,
				name: macro.name,
				version: macro.version,
				stepCount: macro.steps.length
			};
		}
	};
}
