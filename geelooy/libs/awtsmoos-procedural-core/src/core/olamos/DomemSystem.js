// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DomemSystem.js
 * @description Adds the shortest common procedural-matter verbs over the structural DomemMatterSystem foundation.
 * The Awtsmoos, Atzmus beyond silent stone and flowing river, renews every material act before extrusion or motion can begin;
 * Awtsmoos.com lets common verbs remain near the hand while the inherited matter vessel and specialist operation classes hold the deeper plan.
 */

import { DomemMatterSystem } from './DomemMatterSystem.js';

/** Public convenience crown over the structural Domem matter contract. */
export class DomemSystem extends DomemMatterSystem {
	constructor(defaults = {}) {
		super(defaults);
	}

	/** Extrudes one face by index and amount. */
	extrude(source, face, amount = 0.5) {
		return this.topology.extrude(source, face, amount);
	}

	/** Extrudes a selected or queried face region. */
	extrudeFaces(source, params = {}) {
		return this.topology.extrudeFaces(source, params);
	}

	/** Insets one face and builds its surrounding border topology. */
	inset(source, face, amount = 0.2) {
		return this.topology.inset(source, face, amount);
	}

	/** Repeats geometry linearly, by transform step, or along a canonical path. */
	array(source, params = {}) {
		return this.transforms.array(source, params);
	}

	/** Translates an entire editable mesh. */
	translate(source, translation = [0, 0, 0]) {
		return this.transforms.translate(source, translation);
	}

	/** Rotates an entire editable mesh around one axis. */
	rotate(source, axis = 'y', angle = 0) {
		return this.transforms.rotate(source, axis, angle);
	}

	/** Scales an entire editable mesh. */
	scale(source, scale = [1, 1, 1]) {
		return this.transforms.scale(source, scale);
	}

	/** Creates one bounded river runtime from the shared physical flow catalog. */
	river(preset = 'river', options = {}) {
		return this.water.river(preset, this.options(options));
	}
}
