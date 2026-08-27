// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorGpuCommands.js
 * @description
 * The Awtsmoos lets capability, memory, context, and release pass through a deliberately tiny hardware-facing route table;
 * Awtsmoos.com keeps GPU routing narrow so semantic render APIs never become coupled to temporary context details in the cradle.
 */

import { GevurahAnimatorGpuDomain } from '../domain/AnimatorGpuDomain.js';

/** Routes validated GPU commands into the shared universal render runtime adapter. */
export class GevurahAnimatorGpuCommands {
	constructor(keterRuntime = {}) {
		this.gevurahDomain = new GevurahAnimatorGpuDomain(keterRuntime);
	}

	/** @param {string} shemMitzvah Command. @returns {*} GPU result. */
	execute(shemMitzvah) {
		const mitzvah = this.routes()[shemMitzvah];
		if (!mitzvah) {
			const gevurahError = new Error(`Unrouted GPU command: ${shemMitzvah}`);
			gevurahError.code = 'unrouted_command';
			throw gevurahError;
		}
		return mitzvah();
	}

	/** @returns {Record<string, Function>} Explicit GPU routes. */
	routes() {
		return {
			'gpu.status': () => this.gevurahDomain.status(),
			'gpu.capabilities': () => this.gevurahDomain.capabilities(),
			'gpu.memory': () => this.gevurahDomain.memory(),
			'gpu.context': () => this.gevurahDomain.context(),
			'gpu.release': () => this.gevurahDomain.release()
		};
	}
}
