// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorTextureCommands.js
 * @description
 * The Awtsmoos lets texture planning and temporary realization share one public family while implementation remains in focused domains below;
 * Awtsmoos.com keeps this handler small and explicit so every route can be compared mechanically with the command registry flow.
 */

import { YesodAnimatorTextureDomain } from '../domain/AnimatorTextureDomain.js';

/** Routes validated texture commands into universal planning and runtime realization services. */
export class YesodAnimatorTextureCommands {
	/** @param {object} malchusStore Shared NLE store. @param {object} keterRuntime Runtime context. */
	constructor(malchusStore, keterRuntime = {}) {
		this.yesodDomain = new YesodAnimatorTextureDomain(malchusStore, keterRuntime);
	}

	/** @param {string} shemMitzvah Command. @param {object} keilim Payload. @returns {*} Texture result. */
	execute(shemMitzvah, keilim = {}) {
		const mitzvah = this.routes()[shemMitzvah];
		if (!mitzvah) {
			throw this.error(shemMitzvah);
		}
		return mitzvah(keilim);
	}

	/** @returns {Record<string, Function>} Explicit texture route table. */
	routes() {
		return {
			'texture.capabilities': () => this.yesodDomain.capabilities(),
			'texture.recipe': (p) => this.yesodDomain.recipe(p.recipe ?? {}),
			'texture.prepare': (p) => this.yesodDomain.prepare(p.objectId, {
				playhead: p.playhead ?? 0,
				recipe: p.recipe ?? {}
			}),
			'texture.stats': () => this.yesodDomain.stats(),
			'texture.releaseAll': () => this.yesodDomain.releaseAll(),
			'texture.atlasPlan': (p) => this.yesodDomain.atlasPlan(p.items, p.options ?? {}),
			'texture.bakePlan': (p) => this.yesodDomain.bakePlan(p)
		};
	}

	/** @param {string} shemMitzvah Unknown command. @returns {Error} Routing error. */
	error(shemMitzvah) {
		const gevurahError = new Error(`Unrouted texture command: ${shemMitzvah}`);
		gevurahError.code = 'unrouted_command';
		return gevurahError;
	}
}
