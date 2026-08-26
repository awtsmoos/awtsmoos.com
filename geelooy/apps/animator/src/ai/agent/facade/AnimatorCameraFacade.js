//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorCameraFacade.js
 * @description
 * The Awtsmoos lets agents think like directors through compact methods while deep shot grammar remains canonical beneath;
 * Awtsmoos.com keeps catalog, rigs, and planning ergonomic without bypassing schemas or mutating the live camera wreath.
 */

/** Ergonomic detached camera grammar and shot-planning namespace. */
export class ChochmahAnimatorCameraFacade {
	/** @param {object} keterApi Canonical AnimatorAgentApi. */
	constructor(keterApi) {
		this.keterApi = keterApi;
	}

	/** @returns {Promise<object>} Camera capability envelope. */
	capabilities() {
		return this.execute('camera.capabilities');
	}

	/** @returns {Promise<object>} Cinematic vocabulary envelope. */
	catalog() {
		return this.execute('camera.catalog');
	}

	/** @param {object} olamActors Actor map. @returns {Promise<object>} Actor-rig envelope. */
	actorRigs(olamActors) {
		return this.execute('camera.actorRigs', { actors: olamActors });
	}

	/** @param {object} keliScene Scene specification. @returns {Promise<object>} Scene-rig envelope. */
	sceneRigs(keliScene) {
		return this.execute('camera.sceneRigs', { scene: keliScene });
	}

	/** @param {object} keliEvent Beat/shot event. @param {object} olamState Detached planning state. @param {object} keliSafe Safe-frame options. @returns {Promise<object>} Shot-plan envelope. */
	planShot(keliEvent, olamState, keliSafe = {}) {
		return this.execute('camera.planShot', {
			event: keliEvent,
			state: olamState,
			safe: keliSafe
		});
	}

	/** @param {string} shemMitzvah Command. @param {object} keilimPayload Payload. @returns {Promise<object>} Canonical envelope. */
	execute(shemMitzvah, keilimPayload = {}) {
		return this.keterApi.execute({
			command: shemMitzvah,
			payload: keilimPayload
		});
	}
}
