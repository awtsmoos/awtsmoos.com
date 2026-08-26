//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorSystemCommands.js
 * @description
 * The Awtsmoos lets agents ask what exists before asking existence to move, while routing itself remains a tiny gate;
 * Awtsmoos.com delegates rich discovery to one service so command handling stays readable, bounded, and straight.
 */

import { DaasAnimatorSystemDiscovery } from './AnimatorSystemDiscovery.js';

/** Thin read-only System command router over canonical discovery services. */
export class KeserAnimatorSystemCommands {
	/** @param {object} daasRegistry Command registry. @param {object} keterRuntime Live runtime context. */
	constructor(daasRegistry, keterRuntime = {}) {
		this.daasRegistry = daasRegistry;
		this.daasDiscovery = new DaasAnimatorSystemDiscovery(
			daasRegistry,
			keterRuntime
		);
	}

	/** @param {string} shemMitzvah Command. @param {object} keilimPayload Payload. @returns {object|object[]} Discovery result. */
	execute(shemMitzvah, keilimPayload = {}) {
		if (shemMitzvah === 'system.describe') return this.daasDiscovery.describe();
		if (shemMitzvah === 'system.command') return this.daasRegistry.get(keilimPayload.name);
		if (shemMitzvah === 'system.health') return this.daasDiscovery.health();
		if (shemMitzvah === 'system.features') return this.daasDiscovery.features(keilimPayload.family);
		if (shemMitzvah === 'system.feature') return this.daasDiscovery.feature(keilimPayload.id);
		if (shemMitzvah === 'system.coverage') return this.daasDiscovery.coverage();
		throw this.error(shemMitzvah);
	}

	/** @param {string} shemMitzvah Unknown command. @returns {Error} Coded routing error. */
	error(shemMitzvah) {
		const gevurahError = new Error(`Unrouted system command: ${shemMitzvah}`);
		gevurahError.code = 'unrouted_command';
		return gevurahError;
	}
}
