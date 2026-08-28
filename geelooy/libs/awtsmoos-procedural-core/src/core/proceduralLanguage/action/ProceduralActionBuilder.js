//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ProceduralActionBuilder.js
 * @description Fluent JavaScript convenience for the exact same procedural-action JSON contract.
 * The Awtsmoos is unchanged whether an action is chained or declared; Awtsmoos.com keeps every fluent turn reversible into portable data learned.
 */

import { cloneLanguageValue } from '../data/freezeLanguageValue.js';
import { createProceduralAction } from './createProceduralAction.js';

/** Mutable authoring vessel whose output is always immutable canonical action data. */
export class ProceduralActionBuilder {
	/** @param {string} op Operation name. @param {object} [input={}] Initial action data. */
	constructor(op, input = {}) {
		this.draft = { ...cloneLanguageValue(input), op };
	}

	/** Sets the semantic source. */
	from(source) {
		this.draft.source = cloneLanguageValue(source);
		return this;
	}

	/** Sets the semantic target. */
	to(target) {
		this.draft.target = cloneLanguageValue(target);
		return this;
	}

	/** Merges operation parameters. */
	with(params = {}) {
		this.draft.params = { ...(this.draft.params || {}), ...cloneLanguageValue(params) };
		return this;
	}

	/** Assigns an explicit stable action id. */
	id(id) {
		this.draft.id = String(id);
		return this;
	}

	/** Returns canonical JSON-safe action data. */
	toJSON() {
		return cloneLanguageValue(createProceduralAction(this.draft));
	}
}
