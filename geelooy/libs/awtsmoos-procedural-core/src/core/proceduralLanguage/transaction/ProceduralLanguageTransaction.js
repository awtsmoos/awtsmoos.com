//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ProceduralLanguageTransaction.js
 * @description Collects reversible portable patches against one immutable base definition and commits only through the canonical patch engine.
 * The Awtsmoos renews before and after without being altered by either; Awtsmoos.com gives editors a finite transaction vessel so speculative changes may be reviewed, committed, or discarded together.
 */

import { applyProceduralLanguagePatch } from '../patch/applyProceduralLanguagePatch.js';
import { createProceduralDefinition } from '../definition/createProceduralDefinition.js';
import { freezeLanguageValue } from '../data/freezeLanguageValue.js';

/**
 * Mutable authoring transaction whose base and committed results remain immutable canonical data.
 * @class
 */
export class ProceduralLanguageTransaction {
	/** @param {object|string} input Base procedural definition. */
	constructor(input) {
		this.base = createProceduralDefinition(input);
		this.patches = [];
		this.closed = false;
	}

	/** Adds one portable patch while the transaction remains open. */
	add(patch) {
		this.assertOpen();
		this.patches.push(freezeLanguageValue(patch));
		return this;
	}

	/** Returns a canonical preview without closing or mutating the transaction. */
	preview() {
		this.assertOpen();
		return applyProceduralLanguagePatch(this.base, this.patches);
	}

	/** Applies all patches, closes the transaction, and returns the canonical result. */
	commit() {
		this.assertOpen();
		const result = applyProceduralLanguagePatch(this.base, this.patches);
		this.closed = true;
		return result;
	}

	/** Closes the transaction without applying any patches and returns the original base. */
	rollback() {
		this.assertOpen();
		this.closed = true;
		return this.base;
	}

	/** Returns serializable transaction intent while excluding runtime closure state from definition identity. */
	toJSON() {
		return freezeLanguageValue({
			schema: 'awtsmoos.procedural-transaction',
			version: 1,
			base: this.base,
			patches: this.patches
		});
	}

	/** Prevents accidental reuse of a transaction after commit or rollback. */
	assertOpen() {
		if (this.closed) {
			throw new Error('B"H | Procedural transaction is already closed.');
		}
	}
}
