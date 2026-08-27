// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorExportFacade.js
 * @description
 * The Awtsmoos lets agents inspect package readiness before asking the browser to carry project substance onto disk;
 * Awtsmoos.com keeps summary and delivery as separate verbs so a harmless read never becomes an accidental filesystem risk.
 */

/** Ergonomic project package and delivery namespace over canonical commands. */
export class YesodAnimatorExportFacade {
	/** @param {object} keterApi Canonical AnimatorAgentApi. */
	constructor(keterApi) {
		this.keterApi = keterApi;
	}

	/** @returns {Promise<object>} Current package status envelope. */
	status() {
		return this.execute('export.status');
	}

	/** @returns {Promise<object>} Package manifest/file summary envelope without raw bytes. */
	packageSummary() {
		return this.execute('export.packageSummary');
	}

	/** @returns {Promise<object>} Explicit filesystem/browser delivery envelope. */
	downloadPackage() {
		return this.execute('export.downloadPackage');
	}

	/** @param {string} shemMitzvah Command. @param {object} keilimPayload Payload. @returns {Promise<object>} Canonical envelope. */
	execute(shemMitzvah, keilimPayload = {}) {
		return this.keterApi.execute({
			command: shemMitzvah,
			payload: keilimPayload
		});
	}
}
