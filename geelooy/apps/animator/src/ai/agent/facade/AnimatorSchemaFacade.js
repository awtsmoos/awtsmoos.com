// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorSchemaFacade.js
 * @description
 * The Awtsmoos lets humans and AI clients discover and author structured vocabularies through ordinary JavaScript methods, not prose guessing;
 * Awtsmoos.com keeps custom schemas, validation, examples, and generated tool definitions on the same canonical execution blessing.
 */

/** Ergonomic schema-authoring namespace over canonical Agent commands. */
export class DaasAnimatorSchemaFacade {
	/** @param {object} keterApi Canonical API. */
	constructor(keterApi) {
		this.keterApi = keterApi;
	}

	/** @returns {Promise<object>} Schema catalog envelope. */
	list() {
		return this.execute('schema.list');
	}

	/** @param {string} sodId Schema ID. @returns {Promise<object>} Schema entry envelope. */
	get(sodId) {
		return this.execute('schema.get', { id: sodId });
	}

	/** @param {string} sodId Schema ID. @param {*} orValue Candidate data. @returns {Promise<object>} Validation envelope. */
	validate(sodId, orValue) {
		return this.execute('schema.validate', {
			id: sodId,
			value: orValue
		});
	}

	/** @param {string} sodId Schema ID. @returns {Promise<object>} Example envelope. */
	example(sodId) {
		return this.execute('schema.example', { id: sodId });
	}

	/** @param {object} keliEntry Project schema entry. @returns {Promise<object>} Persisted schema envelope. */
	register(keliEntry) {
		return this.execute('schema.register', { entry: keliEntry });
	}

	/** @param {string} sodId Project schema ID. @returns {Promise<object>} Removal envelope. */
	unregister(sodId) {
		return this.execute('schema.unregister', { id: sodId });
	}

	/** @returns {Promise<object>} Vendor-neutral command-tool definition document. */
	toolDefinitions() {
		return this.execute('schema.toolDefinitions');
	}

	/** @param {string} shemMitzvah Command. @param {object} keilimPayload Payload. @returns {Promise<object>} Canonical envelope. */
	execute(shemMitzvah, keilimPayload = {}) {
		return this.keterApi.execute({
			command: shemMitzvah,
			payload: keilimPayload
		});
	}
}
