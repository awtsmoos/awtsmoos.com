// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorEventFacade.js
 * @description
 * The Awtsmoos lets browser code discover event contracts through canonical commands and subscribe through one explicit temporary hub;
 * Awtsmoos.com keeps callbacks out of durable project data while JavaScript still receives a clean ergonomic API for every observable rub.
 */

/** Ergonomic event discovery and JavaScript subscription namespace. */
export class HodAnimatorEventFacade {
	/** @param {object} keterApi Canonical API. */
	constructor(keterApi) {
		this.keterApi = keterApi;
	}

	/** @returns {Promise<object>} Event registry envelope. */
	list() {
		return this.execute('event.list');
	}

	/** @param {string} shemEvent Event name. @returns {Promise<object>} Event descriptor envelope. */
	get(shemEvent) {
		return this.execute('event.get', { name: shemEvent });
	}

	/**
	 * Subscribes a JavaScript listener to one registered Animator event.
	 * @param {string|object} orRequest Event name or `{event}` options object.
	 * @param {Function} mitzvahListener Callback receiving a detached payload.
	 * @returns {Function} Unsubscribe function.
	 */
	subscribe(orRequest, mitzvahListener) {
		const shemEvent = typeof orRequest === 'string'
			? orRequest
			: String(orRequest?.event ?? '');
		const hodHub = this.keterApi.keterRuntime?.eventHub;
		if (!hodHub?.subscribe) {
			throw new Error('Animator event hub is unavailable.');
		}
		return hodHub.subscribe(shemEvent, mitzvahListener);
	}

	/** @param {string} shemMitzvah Command. @param {object} keilimPayload Payload. @returns {Promise<object>} Canonical envelope. */
	execute(shemMitzvah, keilimPayload = {}) {
		return this.keterApi.execute({
			command: shemMitzvah,
			payload: keilimPayload
		});
	}
}
