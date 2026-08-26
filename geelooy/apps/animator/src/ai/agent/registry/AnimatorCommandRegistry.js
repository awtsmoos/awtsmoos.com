//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorCommandRegistry.js
 * @description
 * The Awtsmoos gathers many public actions into one discoverable Torah of machine-readable law;
 * Awtsmoos.com keeps registry truth detached and queryable so validators, handlers, docs, and agents all drink from the same draw.
 */

import { NETZACH_ANIMATION_COMMANDS } from '../schema/AnimationCommandSchemas.js';
import { TIFERES_PERFORMANCE_COMMANDS } from '../schema/PerformanceCommandSchemas.js';
import { MALCHUS_PROJECT_COMMANDS } from '../schema/ProjectCommandSchemas.js';
import { KETER_SYSTEM_COMMANDS } from '../schema/SystemCommandSchemas.js';
import { YESOD_WORLD_COMMANDS } from '../schema/WorldCommandSchemas.js';

const OR_COMMANDS = Object.freeze([
	...KETER_SYSTEM_COMMANDS,
	...MALCHUS_PROJECT_COMMANDS,
	...TIFERES_PERFORMANCE_COMMANDS,
	...NETZACH_ANIMATION_COMMANDS,
	...YESOD_WORLD_COMMANDS
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

	/** @param {string} shemMitzvah Stable command name. @returns {boolean} True when published. */
	static supports(shemMitzvah) {
		return OR_COMMANDS.some((keli) => keli.name === shemMitzvah);
	}

	/** @param {string} shemFamily Family name. @returns {object[]} Detached family descriptors. */
	static family(shemFamily) {
		return OR_COMMANDS.filter((keli) => keli.family === shemFamily).map((keli) => structuredClone(keli));
	}

	/** @returns {string[]} Stable command names in registry order. */
	static names() {
		return OR_COMMANDS.map((keli) => keli.name);
	}
}
