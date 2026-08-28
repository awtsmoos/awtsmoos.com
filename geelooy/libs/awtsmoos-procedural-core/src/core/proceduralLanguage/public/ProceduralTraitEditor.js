//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ProceduralTraitEditor.js
 * @description Adds readable surgical editing verbs over the guarded base so exact nested changes remain simple on the surface and synchronously transactional beneath.
 * The Awtsmoos renews set, merge, increment, scale, toggle, append, removal, and naming before a finite editor speaks;
 * Awtsmoos.com lets every verb stay narrow while one atomic covenant guards the truth it seeks.
 */

import { BinahProceduralTraitEditorBase } from './ProceduralTraitEditorBase.js';

export class GevurahProceduralTraitEditor extends BinahProceduralTraitEditorBase {
	/** @description Replaces exactly one selected trait value path. @param {string} path Relative trait-value path. @param {unknown} value JSON-safe replacement value. @param {object} [guards={}] Optional patch guards. @returns {Readonly<object>} New canonical definition. */
	set(path, value, guards = {}) {
		return this.change('set', path, {...guards, value});
	}

	/** @description Shallow-merges keys into one object-valued trait path. @param {string} path Relative trait-value path. @param {object} value JSON-safe object keys to merge. @param {object} [guards={}] Optional patch guards. @returns {Readonly<object>} New canonical definition. */
	merge(path, value, guards = {}) {
		return this.change('merge', path, {...guards, value});
	}

	/** @description Appends one JSON-safe item to one array-valued trait path. @param {string} path Relative trait-value path. @param {unknown} value Item to append. @param {object} [guards={}] Optional patch guards. @returns {Readonly<object>} New canonical definition. */
	append(path, value, guards = {}) {
		return this.change('append', path, {...guards, value});
	}

	/** @description Removes exactly one addressed trait value or nested collection member. @param {string} path Relative trait-value path. @param {object} [guards={}] Optional patch guards. @returns {Readonly<object>} New canonical definition. */
	remove(path, guards = {}) {
		return this.change('remove', path, guards);
	}

	/** @description Adds a finite numeric delta to exactly one numeric trait value. @param {string} path Relative trait-value path. @param {number} delta Finite signed amount to add. @param {object} [guards={}] Optional patch guards. @returns {Readonly<object>} New canonical definition. */
	increment(path, delta, guards = {}) {
		return this.change('increment', path, {...guards, delta});
	}

	/** @description Multiplies exactly one numeric trait value by a finite factor. @param {string} path Relative trait-value path. @param {number} factor Finite multiplier. @param {object} [guards={}] Optional patch guards. @returns {Readonly<object>} New canonical definition. */
	scale(path, factor, guards = {}) {
		return this.change('scale', path, {...guards, factor});
	}

	/** @description Inverts exactly one boolean trait value. @param {string} path Relative trait-value path. @param {object} [guards={}] Optional patch guards. @returns {Readonly<object>} New canonical definition. */
	toggle(path, guards = {}) {
		return this.change('toggle', path, guards);
	}

	/**
	 * @description Renames the selected trait map key while preserving its data, synchronizing descriptor id, and returning rebuild-sensitive receipt evidence from both old and new identities.
	 * @param {string} tiferesNewTraitId New stable trait id.
	 * @param {object} [binahOptions={}] Optional expect/expectExists guards plus expectedRevision, reason, metadata, and affects.
	 * @returns {Readonly<{definition: object, receipt: object}>} Detailed synchronous atomic rename result.
	 */
	renameTrait(tiferesNewTraitId, binahOptions = {}) {
		const {
			expectedRevision,
			reason,
			metadata,
			affects,
			...gevurahGuards
		} = binahOptions;
		return this.changePathDetailed(
			'rename',
			`traits.${this.traitId}`,
			{...gevurahGuards, to: tiferesNewTraitId},
			{expectedRevision, reason, metadata, affects}
		);
	}
}
