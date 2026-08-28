//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file PortalWorldSession.js
 * @description Gives authors one calm additive world-building vessel while semantic query, revision, diff, and removal live in an inherited operation layer.
 * The Awtsmoos renews each intention before one world gathers another; Awtsmoos.com lets authors add semantic roots naturally,
 * inspect what has been gathered, revise proven roots, dry-run the dependency graph, and compile it without exposing machinery unnecessarily.
 */

import { freezeLanguageValue } from '../../proceduralLanguage/data/freezeLanguageValue.js';
import { PortalWorldSessionOperations } from './PortalWorldSessionOperations.js';

/** Mutable authoring session whose stored recipe intents are immutable snapshots. */
export class PortalWorldSession extends PortalWorldSessionOperations {
	/**
	 * @description Creates one authoring session attached to a Portal facade and optionally installs initial semantic intent snapshots.
	 * @param {object} portal ProceduralPortal facade providing planning, compilation, discovery, query, diff, and revision services.
	 * @param {object|string|Array<object|string>|null} [initial=null] Initial root recipe or recipe collection.
	 * @returns {PortalWorldSession} World authoring session.
	 */
	constructor(portal, initial = null) {
		super();
		this.portal = portal;
		this._inputs = [];
		if (initial !== null && initial !== undefined) {
			const values = Array.isArray(initial)
				? initial
				: [initial];
			for (const value of values) {
				this.add(value);
			}
		}
	}

	/**
	 * @description Adds one immutable semantic intent snapshot and returns the same session for fluent world construction.
	 * @param {object|string} input Semantic recipe intent.
	 * @returns {PortalWorldSession} Same session for fluent composition.
	 */
	add(input) {
		this._inputs.push(freezeLanguageValue(input));
		return this;
	}

	/**
	 * @description Returns frozen authoring snapshots without exposing the mutable internal collection used by explicit session operations.
	 * @returns {readonly *[]} Frozen recipe-intent snapshots.
	 */
	inputs() {
		return Object.freeze([...this._inputs]);
	}

	/**
	 * @description Dry-runs every current root through canonical dependency expansion and finite budget proof.
	 * @param {object} [options={}] Plan-time seed and budget overrides.
	 * @returns {object} Immutable PortalPlan.
	 */
	plan(options = {}) {
		return this.portal.plan(this.inputs(), options);
	}

	/**
	 * @description Plans and compiles the current world session through installed specialist authorities.
	 * @param {object} [options={}] Plan and compile overrides.
	 * @returns {Promise<object>} PortalCompileResult containing runtime outputs and Universal world data.
	 */
	compile(options = {}) {
		return this.portal.compile(this.inputs(), options);
	}

	/**
	 * @description Returns Portal discovery metadata together with the current immutable root intent snapshots.
	 * @returns {Readonly<object>} Frozen session discovery record.
	 */
	describe() {
		return freezeLanguageValue({
			inputs: this.inputs(),
			portal: this.portal.describe()
		});
	}
}
