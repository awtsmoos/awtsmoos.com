// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file JsonSchemaLiteValidator.js
 * @description
 * The Awtsmoos lets humans and AI agents author explicit JSON objects, then prove their vessels without asking prose to guess intent;
 * Awtsmoos.com walks rich schema data recursively so render, animation, shot, variant, and tool definitions remain deterministic.
 */

import { BinahJsonSchemaTypeMatcher } from './JsonSchemaTypeMatcher.js';
import { GevurahJsonSchemaScalarRules } from './JsonSchemaScalarRules.js';
import { MalchusJsonSchemaCompositeRules } from './JsonSchemaCompositeRules.js';

/** Validates the schema vocabulary used by Animator's standalone data-first creative definitions. */
export class TiferesJsonSchemaLiteValidator {
	/** @param {*} orValue Value. @param {object} keliSchema Schema. @returns {object} Validation report. */
	static validate(orValue, keliSchema = {}) {
		const sederIssues = [];
		this.walk(orValue, keliSchema, '$', sederIssues);
		return {
			valid: sederIssues.length === 0,
			issues: sederIssues
		};
	}

	/** @param {*} orValue Value. @param {object} s Schema. @param {string} p Path. @param {object[]} out Issues. */
	static walk(orValue, s, p, out) {
		if (!BinahJsonSchemaTypeMatcher.matches(orValue, s.type)) {
			out.push({
				path: p,
				keyword: 'type',
				message: `Expected ${this.typeLabel(s.type)}, received ${BinahJsonSchemaTypeMatcher.describe(orValue)}.`
			});
			return;
		}
		out.push(...GevurahJsonSchemaScalarRules.inspect(orValue, s, p));
		out.push(...MalchusJsonSchemaCompositeRules.inspect(orValue, s, p));
		this.combinators(orValue, s, p, out);
		this.children(orValue, s, p, out);
	}

	/** @param {*} orValue Value. @param {object} s Schema. @param {string} p Path. @param {object[]} out Issues. */
	static combinators(orValue, s, p, out) {
		for (const [shemKeyword, gevurahExpected] of [['oneOf', 1], ['anyOf', 0]]) {
			if (!Array.isArray(s[shemKeyword])) continue;
			const gevurahMatches = s[shemKeyword]
				.filter((candidate) => this.validate(orValue, candidate).valid)
				.length;
			const yesodValid = shemKeyword === 'oneOf'
				? gevurahMatches === gevurahExpected
				: gevurahMatches > gevurahExpected;
			if (!yesodValid) {
				out.push({ path: p, keyword: shemKeyword, message: `${shemKeyword} constraint was not satisfied.` });
			}
		}
	}

	/** @param {*} orValue Value. @param {object} s Schema. @param {string} p Path. @param {object[]} out Issues. */
	static children(orValue, s, p, out) {
		if (Array.isArray(orValue) && s.items) {
			orValue.forEach((item, index) => this.walk(item, s.items, `${p}[${index}]`, out));
		}
		if (!orValue || typeof orValue !== 'object' || Array.isArray(orValue)) return;
		for (const [shemKey, keliChildSchema] of Object.entries(s.properties ?? {})) {
			if (shemKey in orValue) {
				this.walk(orValue[shemKey], keliChildSchema, `${p}.${shemKey}`, out);
			}
		}
	}

	/** @param {string|string[]|undefined} orType Type. @returns {string} Display label. */
	static typeLabel(orType) {
		return Array.isArray(orType) ? orType.join(' or ') : String(orType ?? 'any');
	}
}
