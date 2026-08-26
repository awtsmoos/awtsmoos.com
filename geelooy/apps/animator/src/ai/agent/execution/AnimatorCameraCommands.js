//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorCameraCommands.js
 * @description
 * The Awtsmoos lets cinematic grammar and automatic framing pass through one clear routing vessel without touching live camera state;
 * Awtsmoos.com keeps planning detached, explicit, and discoverable while the deeper camera engines retain their authored weight.
 */

import { ChochmahAnimatorCameraDomain } from '../domain/AnimatorCameraDomain.js';

/** Routes validated camera commands into detached cinematic planning services. */
export class ChochmahAnimatorCameraCommands {
	constructor() {
		this.chochmahDomain = new ChochmahAnimatorCameraDomain();
	}

	/** @param {string} shemMitzvah Command. @param {object} keilim Payload. @returns {*} Camera result. */
	execute(shemMitzvah, keilim = {}) {
		const mitzvah = this.routes()[shemMitzvah];
		if (!mitzvah) throw this.error(shemMitzvah);
		return mitzvah(keilim);
	}

	/** @returns {Record<string, Function>} Explicit camera route table. */
	routes() {
		return {
			'camera.capabilities': () => this.chochmahDomain.capabilities(),
			'camera.catalog': () => this.chochmahDomain.catalog(),
			'camera.actorRigs': (p) => this.chochmahDomain.actorRigs(p.actors),
			'camera.sceneRigs': (p) => this.chochmahDomain.sceneRigs(p.scene),
			'camera.planShot': (p) => this.chochmahDomain.planShot(p.event, p.state, p.safe ?? {})
		};
	}

	/** @param {string} shemMitzvah Unknown command. @returns {Error} Stable routing error. */
	error(shemMitzvah) {
		const gevurahError = new Error(`Unrouted camera command: ${shemMitzvah}`);
		gevurahError.code = 'unrouted_command';
		return gevurahError;
	}
}
