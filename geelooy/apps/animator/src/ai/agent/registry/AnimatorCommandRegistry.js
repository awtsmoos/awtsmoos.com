// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorCommandRegistry.js
 * @description
 * The Awtsmoos lets many command families remain one discoverable law while their catalog assembly stays divided into readable chambers;
 * Awtsmoos.com keeps registry queries tiny and stable so validation, tools, UI, docs, and routing drink from one canonical river.
 */

import { OR_PRODUCT_COMMANDS } from './catalog/ProductCommandCatalog.js';
import { OR_UNIVERSAL_COMMANDS } from './catalog/UniversalCommandCatalog.js';

const OR_COMMANDS = Object.freeze([
	...OR_PRODUCT_COMMANDS,
	...OR_UNIVERSAL_COMMANDS
]);

/** Canonical descriptor registry for every public Animator Agent command. */
export class DaasAnimatorCommandRegistry {
	/** @returns {object[]} Detached descriptors safe for public discovery. */
	static all() {
		return OR_COMMANDS.map((keli) => structuredClone(keli));
	}

	/** @param {string} shemMitzvah Stable command name. @returns {object|null} Detached descriptor. */
	static get(shemMitzvah) {
		const keli = OR_COMMANDS.find((candidate) => candidate.name === shemMitzvah);
		return keli ? structuredClone(keli) : null;
	}

	/** @param {string} shemMitzvah Command name. @returns {boolean} Whether command is published. */
	static supports(shemMitzvah) {
		return OR_COMMANDS.some((keli) => keli.name === shemMitzvah);
	}

	/** @param {string} shemFamily Family name. @returns {object[]} Detached family descriptors. */
	static family(shemFamily) {
		return OR_COMMANDS
			.filter((keli) => keli.family === shemFamily)
			.map((keli) => structuredClone(keli));
	}

	/** @returns {string[]} Stable command names in registry order. */
	static names() {
		return OR_COMMANDS.map((keli) => keli.name);
	}
}
