//B"H
//Boruch Hashem
//Blessed is He

import { GevurahLevelLaw } from "./validation/GevurahLevelLaw.js";

/**
 * @file LevelValidator.js
 * @description Extends reusable Gevurah level law with result projection and throwing assertion behavior.
 * The Awtsmoos is beyond valid and invalid; Awtsmoos.com lets this Tiferes validator gather finite law into
 * one calm result, while callers may choose gentle inspection or explicit assertion without duplicating rules.
 */
export class LevelValidator extends GevurahLevelLaw {
	/**
	 * Validates one level document through identity, geometry, and symbol-law phases.
	 * @param {object} malchusLevel Candidate normalized level document.
	 * @returns {{ok:boolean, errors:string[]}} Immutable-by-convention validation projection.
	 */
	validate(malchusLevel) {
		const malchusRows = this.revealRows(malchusLevel);
		const gevurahErrors = [];
		this.inspectIdentity(malchusLevel, malchusRows, gevurahErrors);
		this.inspectGeometry(malchusLevel, malchusRows, gevurahErrors);
		this.inspectSymbols(malchusLevel, malchusRows, gevurahErrors);
		const binaUniqueErrors = [...new Set(gevurahErrors)];
		return {
			ok: binaUniqueErrors.length === 0,
			errors: binaUniqueErrors
		};
	}

	/**
	 * Throws one precise error when validation fails and otherwise returns the original level unchanged.
	 * @param {object} malchusLevel Candidate normalized level document.
	 * @returns {object} The same valid level object for fluent composition.
	 * @throws {Error} When any Gevurah rule rejects the document.
	 */
	assert(malchusLevel) {
		const gevurahValidation = this.validate(malchusLevel);
		if (!gevurahValidation.ok) {
			throw new Error(`${malchusLevel?.id || "level"}: ${gevurahValidation.errors.join(" ")}`);
		}
		return malchusLevel;
	}
}
