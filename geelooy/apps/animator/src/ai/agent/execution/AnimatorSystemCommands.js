//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorSystemCommands.js
 * @description
 * The Awtsmoos lets knowledge precede action so an agent may discover the vessel before moving its light;
 * Awtsmoos.com serves protocol, command, and health introspection from the same registry that execution trusts as right.
 */

import { KeserAnimatorProtocol } from '../protocol/AnimatorProtocol.js';
import { SefirotAnimatorCommandFamilies } from '../registry/AnimatorCommandFamilies.js';

/** Handles read-only system discovery commands against the canonical registry. */
export class KeserAnimatorSystemCommands {
	/** @param {typeof import('../registry/AnimatorCommandRegistry.js').DaasAnimatorCommandRegistry} daasRegistry Registry class. */
	constructor(daasRegistry) {
		this.daasRegistry = daasRegistry;
	}

	/** @param {string} shemMitzvah Command. @param {object} keilimPayload Payload. @returns {object} Discovery result. */
	execute(shemMitzvah, keilimPayload = {}) {
		if (shemMitzvah === 'system.describe') return this.describe();
		if (shemMitzvah === 'system.command') return this.daasRegistry.get(keilimPayload.name);
		if (shemMitzvah === 'system.health') return this.health();
		throw this.error(`Unrouted system command: ${shemMitzvah}`);
	}

	/** @returns {object} Complete machine-readable protocol and command discovery document. */
	describe() {
		const keterProtocol = KeserAnimatorProtocol.describe();
		return {
			protocol: keterProtocol,
			families: SefirotAnimatorCommandFamilies.all(),
			commands: this.daasRegistry.all(),
			bootstrap: {
				global: `window.${keterProtocol.namespace}`,
				readyEvent: keterProtocol.readyEvent,
				canonicalMethod: 'execute'
			}
		};
	}

	/** @returns {object} Read-only readiness and registry consistency report. */
	health() {
		const sederNames = this.daasRegistry.names();
		return { ok: true, ready: true, commandCount: sederNames.length, uniqueCommands: new Set(sederNames).size === sederNames.length, protocol: KeserAnimatorProtocol.describe() };
	}

	/** @param {string} orMessage Message. @returns {Error} Coded routing error. */
	error(orMessage) {
		const gevurahError = new Error(orMessage);
		gevurahError.code = 'unrouted_command';
		return gevurahError;
	}
}
