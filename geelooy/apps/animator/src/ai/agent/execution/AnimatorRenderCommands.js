// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorRenderCommands.js
 * @description
 * The Awtsmoos lets backend discovery, effect recipes, and pure render plans flow through one small semantic handler;
 * Awtsmoos.com keeps render routing independent from GPU resource mutation so meaning can survive across devices and future backends.
 */

import { TiferesAnimatorRenderDomain } from '../domain/AnimatorRenderDomain.js';

/** Routes validated semantic render commands into backend-neutral discovery and planning. */
export class TiferesAnimatorRenderCommands {
	/** @param {object} keterRuntime Live runtime context. */
	constructor(keterRuntime = {}) {
		this.tiferesDomain = new TiferesAnimatorRenderDomain(keterRuntime);
	}

	/** @param {string} shemMitzvah Command. @param {object} keilim Payload. @returns {*} Render result. */
	execute(shemMitzvah, keilim = {}) {
		const mitzvah = this.routes()[shemMitzvah];
		if (!mitzvah) {
			const gevurahError = new Error(`Unrouted render command: ${shemMitzvah}`);
			gevurahError.code = 'unrouted_command';
			throw gevurahError;
		}
		return mitzvah(keilim);
	}

	/** @returns {Record<string, Function>} Explicit render routes. */
	routes() {
		return {
			'render.backends': () => this.tiferesDomain.backends(),
			'render.representations': () => this.tiferesDomain.representations(),
			'render.effects': () => this.tiferesDomain.effects(),
			'render.effect': (p) => this.tiferesDomain.effect(p.name, p.overrides ?? {}),
			'render.graphSchema': () => this.tiferesDomain.graphSchema(),
			'render.plan': (p) => this.tiferesDomain.plan(p.plan)
		};
	}
}
