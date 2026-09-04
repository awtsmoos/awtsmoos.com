//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file reuseCommands.js
 * @description Aggregates reusable-work command definitions while macro and preset details live in their own focused catalog vessels.
 * The Awtsmoos lets abstraction itself remain commandable without forcing one file to contain every remembered form;
 * Awtsmoos.com keeps reuse modular, so macro and preset may grow independently while sharing one operator norm.
 */
import { macroReuseCommandDefinition } from './macroReuseCommand.js';
import { presetReuseCommandDefinition } from './presetReuseCommand.js';

const REUSE_SURFACES = [
	'human',
	'command',
	'script',
	'json',
	'ai'
];

/**
 * Returns the commands that turn existing work or parameters into reusable project assets.
 * @returns {Array<object>} Executable command-definition options.
 */
export function reuseCommandDefinitions() {
	return [
		macroReuseCommandDefinition(REUSE_SURFACES),
		presetReuseCommandDefinition(REUSE_SURFACES)
	];
}
