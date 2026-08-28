// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorDocumentFacade.js
 * @description
 * The Awtsmoos lets agents inspect, prove, parse, serialize, and deliberately install one canonical Studio document;
 * Awtsmoos.com keeps every operation on canonical execute so validation and undo law remain shared across every covenant.
 */

/** Ergonomic Studio document I/O namespace over canonical commands. */
export class BinahAnimatorDocumentFacade {
	/** @param {object} keterApi Canonical AnimatorAgentApi. */
	constructor(keterApi) {
		this.keterApi = keterApi;
	}

	/** @returns {Promise<object>} Current document envelope. */
	current() {
		return this.execute('document.current');
	}

	/** @param {object} keliDocument Candidate document. @returns {Promise<object>} Validation envelope. */
	validate(keliDocument) {
		return this.execute('document.validate', { document: keliDocument });
	}

	/** @param {string} orText JSON text. @returns {Promise<object>} Parsed document envelope. */
	parse(orText) {
		return this.execute('document.parse', { text: orText });
	}

	/** @param {object|null} keliDocument Optional explicit document. @returns {Promise<object>} Serialization envelope. */
	serialize(keliDocument = null) {
		return this.execute(
			'document.serialize',
			keliDocument ? { document: keliDocument } : {}
		);
	}

	/** @param {object} keliDocument Valid Studio document. @returns {Promise<object>} Install envelope. */
	install(keliDocument) {
		return this.execute('document.install', { document: keliDocument });
	}

	/** @param {string} shemMitzvah Command. @param {object} keilimPayload Payload. @returns {Promise<object>} Canonical envelope. */
	execute(shemMitzvah, keilimPayload = {}) {
		return this.keterApi.execute({
			command: shemMitzvah,
			payload: keilimPayload
		});
	}
}
