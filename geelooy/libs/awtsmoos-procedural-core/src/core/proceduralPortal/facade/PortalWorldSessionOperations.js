//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file PortalWorldSessionOperations.js
 * @description Adds semantic query, diff, revision, mutation, and removal to world sessions while current root identity is always resolved by canonical planning.
 * The Awtsmoos renews a gathered world without confusing branch for root; Awtsmoos.com lets this Malchus-like authoring layer
 * change only one proven root at a time while immutable snapshots and Portal-wide semantic laws remain the source beneath the current state.
 */

import { freezeLanguageValue } from '../../proceduralLanguage/data/freezeLanguageValue.js';
import { resolvePortalSessionRootIndex } from './PortalWorldSessionRoots.js';

/** Operation layer inherited by PortalWorldSession after its concrete constructor installs Portal and root storage. */
export class PortalWorldSessionOperations {
	/**
	 * @description Queries the current authored world through the Portal's canonical planning and deterministic semantic query law.
	 * @param {object} [criteria={}] Serializable query criteria such as id, kind, root status, dependency, trait, or text.
	 * @param {object} [options={}] Seed and budget planning overrides.
	 * @returns {Readonly<object>} Frozen semantic query result over the current root snapshots and their expanded dependencies.
	 */
	query(criteria = {}, options = {}) {
		return this.portal.query(this.inputs(), criteria, options);
	}

	/**
	 * @description Diffs the current authored world against another session or semantic root collection without compiling either side.
	 * @param {*} other PortalWorldSession-like object exposing inputs(), or another semantic intent/root collection.
	 * @param {object} [options={}] Shared seed and budget planning overrides.
	 * @returns {Readonly<object>} Frozen semantic diff receipt.
	 */
	diff(other, options = {}) {
		const after = other && typeof other.inputs === 'function'
			? other.inputs()
			: other;
		return this.portal.diff(this.inputs(), after, options);
	}

	/**
	 * @description Replaces exactly one authored root with an immutable derived revision after resolving its current canonical root identity through planning.
	 * @param {string} id Current canonical root identifier.
	 * @param {object} [overrides={}] Section-aware Procedural Language overrides for the derived definition.
	 * @param {object} [options={}] Root-resolution planning options containing optional seed and budget.
	 * @returns {PortalWorldSessionOperations} Same mutable session for fluent authoring while the stored replacement remains immutable.
	 */
	revise(id, overrides = {}, options = {}) {
		const index = resolvePortalSessionRootIndex(
			this.portal,
			this.inputs(),
			id,
			options
		);
		const revised = this.portal.revise(this._inputs[index], overrides, {
			index,
			seed: options.seed
		});
		this._inputs[index] = freezeLanguageValue(revised);
		return this;
	}

	/**
	 * @description Provides a mutation-shaped authoring verb while preserving the Portal rule that semantic changes are immutable derived revisions rather than in-place object edits.
	 * @param {string} id Current canonical root identifier.
	 * @param {object} [overrides={}] Section-aware semantic overrides.
	 * @param {object} [options={}] Root-resolution planning options.
	 * @returns {PortalWorldSessionOperations} Same session after replacing the targeted root with an immutable revision.
	 */
	mutate(id, overrides = {}, options = {}) {
		return this.revise(id, overrides, options);
	}

	/**
	 * @description Removes exactly one current authored root after canonical identity resolution and ambiguity protection.
	 * @param {string} id Current canonical root identifier.
	 * @param {object} [options={}] Root-resolution planning options containing optional seed and budget.
	 * @returns {PortalWorldSessionOperations} Same session for fluent authoring after root removal.
	 */
	remove(id, options = {}) {
		const index = resolvePortalSessionRootIndex(
			this.portal,
			this.inputs(),
			id,
			options
		);
		this._inputs.splice(index, 1);
		return this;
	}
}
