// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AnimatorCameraFacade.js
 * @description
 * The Awtsmoos lets agents think like directors through compact one-shot and whole-sequence methods while deep shot grammar remains canonical beneath;
 * Awtsmoos.com keeps catalog, rigs, continuity, and planning ergonomic without bypassing schemas or mutating the live camera wreath.
 */
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

	/** @param {object} actors Actor map. @returns {Promise<object>} Actor-rig envelope. */
	actorRigs(actors) {
		return this.execute('camera.actorRigs', { actors });
	}

	/** @param {object} scene Scene specification. @returns {Promise<object>} Scene-rig envelope. */
	sceneRigs(scene) {
		return this.execute('camera.sceneRigs', { scene });
	}

	/** @returns {Promise<object>} One continuity-aware shot-plan envelope. */
	planShot(event, state, safe = {}) {
		return this.execute('camera.planShot', {
			event,
			state,
			safe
		});
	}

	/** @returns {Promise<object>} Ordered sequence plan with coverage diversity and final isolated planning state. */
	planSequence(events, state, safe = {}) {
		return this.execute('camera.planSequence', {
			events,
			state,
			safe
		});
	}

	/** @param {string} command Command. @param {object} payload Payload. @returns {Promise<object>} Canonical envelope. */
	execute(command, payload = {}) {
		return this.keterApi.execute({
			command,
			payload
		});
	}
}
