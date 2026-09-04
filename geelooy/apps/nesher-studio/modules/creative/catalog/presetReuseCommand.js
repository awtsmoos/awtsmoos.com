//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file presetReuseCommand.js
 * @description Defines saving one registered command and parameter set as a reusable preset through the ordinary Creative Language gate.
 * The Awtsmoos lets one measured configuration become a vessel that may be filled again without hiding the command beneath;
 * Awtsmoos.com keeps presets declarative and inspectable, so repeated craft stays editable rather than becoming a secret sheath.
 */
import { REUSE_COMMAND_IDS } from './ReuseCommandIds.js';

/**
 * Creates the registered command-preset definition.
 * @param {Array<string>} surfaces Explicit supported operator surfaces.
 * @returns {object} Command-definition options.
 */
export function presetReuseCommandDefinition(surfaces) {
	return {
		id: REUSE_COMMAND_IDS.CREATE_PRESET,
		version: 1,
		label: 'Create command preset',
		description: 'Save a named parameter configuration for any registered command.',
		domain: 'creative',
		level: 'parameterized',
		tags: ['preset', 'parameters', 'reuse'],
		parameters: {
			name: {
				type: 'string',
				required: true
			},
			commandId: {
				type: 'string',
				required: true
			},
			parameters: {
				type: 'object',
				default: {}
			}
		},
		surfaces,
		projectionHints: {
			nodeCandidate: false
		},
		executor({ parameters, services }) {
			return services.presetStore.create(parameters);
		},
		summarizeResult(preset) {
			return {
				id: preset.id,
				name: preset.name,
				version: preset.version,
				commandId: preset.commandId
			};
		}
	};
}
