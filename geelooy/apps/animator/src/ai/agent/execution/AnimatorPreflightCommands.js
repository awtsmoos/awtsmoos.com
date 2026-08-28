// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorPreflightCommands.js
 * @description
 * The Awtsmoos lets production audits pass through one tiny read-only handler while each rule remains a separate inspectable vessel;
 * Awtsmoos.com keeps preflight routing boring and explicit so new evidence can be added without turning judgment into a monolithic wrestle.
 */

import { GevurahAnimatorPreflightDomain } from '../domain/AnimatorPreflightDomain.js';

/** Routes validated preflight commands into the read-only project audit domain. */
export class GevurahAnimatorPreflightCommands {
	/** @param {object} malchusStore Shared NLE store. @param {object} keterRuntime Runtime context. */
	constructor(malchusStore, keterRuntime = {}) {
		this.gevurahDomain = new GevurahAnimatorPreflightDomain(
			malchusStore,
			keterRuntime
		);
	}

	/** @param {string} shemMitzvah Command. @returns {*} Preflight result. */
	execute(shemMitzvah) {
		const mitzvah = this.routes()[shemMitzvah];
		if (!mitzvah) {
			const gevurahError = new Error(`Unrouted preflight command: ${shemMitzvah}`);
			gevurahError.code = 'unrouted_command';
			throw gevurahError;
		}
		return mitzvah();
	}

	/** @returns {Record<string, Function>} Explicit preflight routes. */
	routes() {
		return {
			'preflight.capabilities': () => this.gevurahDomain.capabilities(),
			'preflight.rules': () => this.gevurahDomain.rules(),
			'preflight.run': () => this.gevurahDomain.run()
		};
	}
}
