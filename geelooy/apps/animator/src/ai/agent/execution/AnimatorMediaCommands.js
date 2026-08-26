//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorMediaCommands.js
 * @description
 * The Awtsmoos lets video inspection and persistent import share one public family while raw Blob ownership stays below;
 * Awtsmoos.com routes every operation into the shared media domain so the Agent API never grows a rival persistence flow.
 */

import { YesodAnimatorMediaDomain } from '../domain/AnimatorMediaDomain.js';

/** Routes validated Media family commands into the shared live NLE media adapter. */
export class YesodAnimatorMediaCommands {
	/** @param {object} malchusStore Shared NLE store. @param {object} keterRuntime Live Animator runtime. */
	constructor(malchusStore, keterRuntime = {}) {
		this.yesodDomain = new YesodAnimatorMediaDomain(
			malchusStore,
			keterRuntime
		);
	}

	/** @param {string} shemMitzvah Command. @param {object} keilim Payload. @returns {*} Media result. */
	execute(shemMitzvah, keilim = {}) {
		const mitzvah = this.routes()[shemMitzvah];
		if (!mitzvah) {
			throw this.error(shemMitzvah);
		}
		return mitzvah(keilim);
	}

	/** @returns {Record<string, Function>} Explicit media route table. */
	routes() {
		return {
			'media.capabilities': () => this.yesodDomain.capabilities(),
			'media.assets': () => this.yesodDomain.assets(),
			'media.videoMetadata': (p) => this.yesodDomain.videoMetadata(p.source),
			'media.describeVideo': (p) => this.yesodDomain.describeVideo(p.source),
			'media.importVideo': (p) => this.yesodDomain.importVideo(p.source)
		};
	}

	/** @param {string} shemMitzvah Unknown command. @returns {Error} Stable routing error. */
	error(shemMitzvah) {
		const gevurahError = new Error(`Unrouted media command: ${shemMitzvah}`);
		gevurahError.code = 'unrouted_command';
		return gevurahError;
	}
}
