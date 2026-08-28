// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file JsonSchemaScalarRules.js
 * @description
 * The Awtsmoos lets numbers and strings remain inside declared vessels, neither too small nor wandering beyond their gate;
 * Awtsmoos.com gathers scalar limits, enum, and const checks separately so recursive validation stays readable and straight.
 */

/** Validates scalar JSON-Schema-like constraints and returns compact issue objects. */
export class GevurahJsonSchemaScalarRules {
	/** @param {*} orValue Value. @param {object} keliSchema Schema. @param {string} sodPath Path. @returns {object[]} Issues. */
	static inspect(orValue, keliSchema = {}, sodPath = '$') {
		const sederIssues = [];
		if ('const' in keliSchema && !Object.is(orValue, keliSchema.const)) {
			sederIssues.push(this.issue(sodPath, 'const', 'Value does not equal schema const.'));
		}
		if (Array.isArray(keliSchema.enum) && !keliSchema.enum.some((item) => Object.is(item, orValue))) {
			sederIssues.push(this.issue(sodPath, 'enum', 'Value is not in the allowed enum.'));
		}
		if (typeof orValue === 'string') {
			this.stringRules(orValue, keliSchema, sodPath, sederIssues);
		}
		if (typeof orValue === 'number' && Number.isFinite(orValue)) {
			this.numberRules(orValue, keliSchema, sodPath, sederIssues);
		}
		return sederIssues;
	}

	/** @param {string} orValue String. @param {object} s Schema. @param {string} p Path. @param {object[]} out Issues. */
	static stringRules(orValue, s, p, out) {
		if (Number.isFinite(s.minLength) && orValue.length < s.minLength) {
			out.push(this.issue(p, 'minLength', `String must contain at least ${s.minLength} characters.`));
		}
		if (Number.isFinite(s.maxLength) && orValue.length > s.maxLength) {
			out.push(this.issue(p, 'maxLength', `String must contain at most ${s.maxLength} characters.`));
		}
	}

	/** @param {number} orValue Number. @param {object} s Schema. @param {string} p Path. @param {object[]} out Issues. */
	static numberRules(orValue, s, p, out) {
		if (Number.isFinite(s.minimum) && orValue < s.minimum) {
			out.push(this.issue(p, 'minimum', `Number must be at least ${s.minimum}.`));
		}
		if (Number.isFinite(s.maximum) && orValue > s.maximum) {
			out.push(this.issue(p, 'maximum', `Number must be at most ${s.maximum}.`));
		}
	}

	/** @param {string} path Path. @param {string} keyword Keyword. @param {string} message Message. @returns {object} Issue. */
	static issue(path, keyword, message) {
		return { path, keyword, message };
	}
}
