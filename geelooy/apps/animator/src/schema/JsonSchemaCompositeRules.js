// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file JsonSchemaCompositeRules.js
 * @description
 * The Awtsmoos lets arrays and objects carry many children while each required name and unique item keeps a measured place;
 * Awtsmoos.com centralizes composite rules so recursive schema walking may remain a small transparent grace.
 */

import { BinahRenderableRevision } from '../renderable/model/RenderableRevision.js';

/** Validates non-recursive array/object constraints and reports child paths for the recursive walker. */
export class MalchusJsonSchemaCompositeRules {
	/** @param {*} orValue Value. @param {object} keliSchema Schema. @param {string} sodPath Path. @returns {object[]} Local issues. */
	static inspect(orValue, keliSchema = {}, sodPath = '$') {
		if (Array.isArray(orValue)) {
			return this.arrayRules(orValue, keliSchema, sodPath);
		}
		if (orValue && typeof orValue === 'object') {
			return this.objectRules(orValue, keliSchema, sodPath);
		}
		return [];
	}

	/** @param {any[]} sederValue Array. @param {object} s Schema. @param {string} p Path. @returns {object[]} Issues. */
	static arrayRules(sederValue, s, p) {
		const out = [];
		if (Number.isFinite(s.minItems) && sederValue.length < s.minItems) {
			out.push(this.issue(p, 'minItems', `Array requires at least ${s.minItems} items.`));
		}
		if (Number.isFinite(s.maxItems) && sederValue.length > s.maxItems) {
			out.push(this.issue(p, 'maxItems', `Array allows at most ${s.maxItems} items.`));
		}
		if (s.uniqueItems) {
			const sederKeys = sederValue.map((item) => BinahRenderableRevision.stringify(item));
			if (new Set(sederKeys).size !== sederKeys.length) {
				out.push(this.issue(p, 'uniqueItems', 'Array items must be unique.'));
			}
		}
		return out;
	}

	/** @param {object} keliValue Object. @param {object} s Schema. @param {string} p Path. @returns {object[]} Issues. */
	static objectRules(keliValue, s, p) {
		const out = [];
		for (const shemRequired of s.required ?? []) {
			if (!(shemRequired in keliValue)) {
				out.push(this.issue(`${p}.${shemRequired}`, 'required', 'Required property is missing.'));
			}
		}
		if (s.additionalProperties === false && s.properties) {
			for (const shemKey of Object.keys(keliValue)) {
				if (!(shemKey in s.properties)) {
					out.push(this.issue(`${p}.${shemKey}`, 'additionalProperties', 'Additional property is not allowed.'));
				}
			}
		}
		return out;
	}

	/** @param {string} path Path. @param {string} keyword Keyword. @param {string} message Message. @returns {object} Issue. */
	static issue(path, keyword, message) {
		return { path, keyword, message };
	}
}
