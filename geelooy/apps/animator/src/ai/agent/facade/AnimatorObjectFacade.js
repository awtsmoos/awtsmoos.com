// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorObjectFacade.js
 * @description
 * The Awtsmoos lets agents behold and configure universal drawable identity through humane verbs without touching private state;
 * Awtsmoos.com keeps every method on canonical execute so representation recipes remain validated, traced, and undo-safe.
 */

/** Ergonomic universal-renderable object namespace over canonical Agent commands. */
export class KeterAnimatorObjectFacade {
	/** @param {object} keterApi Canonical AnimatorAgentApi. */
	constructor(keterApi) {
		this.keterApi = keterApi;
	}

	/** @returns {Promise<object>} Object capability envelope. */
	capabilities() {
		return this.execute('object.capabilities');
	}

	/** @returns {Promise<object>} All renderable descriptors. */
	list() {
		return this.execute('object.list');
	}

	/** @param {string} sodObjectId Object ID. @returns {Promise<object>} One descriptor. */
	get(sodObjectId) {
		return this.execute('object.get', { id: sodObjectId });
	}

	/** @param {object} keliFilter Query filter. @returns {Promise<object>} Matching descriptors. */
	query(keliFilter = {}) {
		return this.execute('object.query', { filter: keliFilter });
	}

	/** @param {string} sodObjectId Object ID. @returns {Promise<object>} Dependencies. */
	dependencies(sodObjectId) {
		return this.execute('object.dependencies', { id: sodObjectId });
	}

	/** @param {string} sodObjectId Object ID. @returns {Promise<object>} Dependents. */
	dependents(sodObjectId) {
		return this.execute('object.dependents', { id: sodObjectId });
	}

	/** @param {string} sodObjectId Object ID. @param {object} keliRenderable Durable data. @returns {Promise<object>} Updated entity. */
	setRenderable(sodObjectId, keliRenderable) {
		return this.execute('object.setRenderable', {
			id: sodObjectId,
			renderable: keliRenderable
		});
	}

	/** @param {string} sodObjectId Object ID. @param {string} shemKind Representation kind. @param {object} keliRepresentation Recipe. @returns {Promise<object>} Updated entity. */
	setRepresentation(sodObjectId, shemKind, keliRepresentation) {
		return this.execute('object.setRepresentation', {
			id: sodObjectId,
			kind: shemKind,
			representation: keliRepresentation
		});
	}

	/** @param {string} sodObjectId Object ID. @param {string[]} sederTraits Explicit traits. @returns {Promise<object>} Updated entity. */
	setTraits(sodObjectId, sederTraits) {
		return this.execute('object.setTraits', {
			id: sodObjectId,
			traits: sederTraits
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
