//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorPayloadNormalizer.js
 * @description
 * The Awtsmoos lets validation and execution behold the same cleaned vessel instead of two subtly different forms;
 * Awtsmoos.com normalizes schema-declared strings recursively so whitespace can never validate one intention and execute another storm.
 */

/** Produces detached canonical payload values according to the public schema vocabulary. */
export class YesodAnimatorPayloadNormalizer {
	/** @param {object} keliSchema Schema. @param {*} orValue Candidate value. @returns {*} Detached normalized value. */
	static normalize(keliSchema = {}, orValue) {
		if (keliSchema.type === 'string') return typeof orValue === 'string' ? orValue.trim() : orValue;
		if (keliSchema.type === 'array') return this.array(keliSchema, orValue);
		if (keliSchema.type === 'object') return this.object(keliSchema, orValue);
		return orValue;
	}

	/** @param {object} keliSchema Array schema. @param {*} orValue Candidate value. @returns {*} Normalized array or original value. */
	static array(keliSchema, orValue) {
		if (!Array.isArray(orValue)) return orValue;
		return orValue.map((orItem) => this.normalize(keliSchema.items ?? {}, orItem));
	}

	/** @param {object} keliSchema Object schema. @param {*} orValue Candidate value. @returns {*} Detached object or original value. */
	static object(keliSchema, orValue) {
		if (!orValue || typeof orValue !== 'object' || Array.isArray(orValue)) return orValue;
		const keilimOutput = { ...orValue };
		for (const [shemKey, keliChild] of Object.entries(keliSchema.properties ?? {})) {
			if (keilimOutput[shemKey] !== undefined) keilimOutput[shemKey] = this.normalize(keliChild, keilimOutput[shemKey]);
		}
		return keilimOutput;
	}
}
