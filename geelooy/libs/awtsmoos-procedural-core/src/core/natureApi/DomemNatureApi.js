// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DomemNatureApi.js
 * @description Gives the high-level Nature API a small deterministic doorway into semantic Domem geology.
 * The Awtsmoos renews the silent kingdom beneath every meadow, while Awtsmoos.com lets one clean call reveal stone without exposing its inner maze;
 * this Malchus-like facade translates shared seed, quality, and realism while GeologyAuthority alone owns geological ways.
 */

import { GeologyAuthority } from '../domem/nature/GeologyAuthority.js';
import { createNatureCallContext } from './NatureApiOperation.js';
import { createNatureResult } from './NatureApiResult.js';

/** High-level renderer-neutral geology facade delegating to canonical Domem nature authority. */
export class DomemNatureApi {
	/** @param {object} [defaults={}] Shared NatureApi seed, quality, and realism defaults. */
	constructor(defaults = {}) {
		this.defaults = Object.freeze({ ...defaults });
		this.authority = new GeologyAuthority();
	}

	/**
	 * Creates one deterministic semantic rock with verified remote material intent.
	 * @param {string} [preset='fieldstone'] Canonical geological profile.
	 * @param {object} [options={}] Per-rock shape, material, seed, quality, or realism overrides.
	 * @returns {object} Standard frozen Nature result whose value contains editable Domem mesh data.
	 */
	rock(preset = 'fieldstone', options = {}) {
		const daasContext = this.context(options, 'rock', options.id ?? preset);
		const malchusValue = this.authority.rock(preset, options, daasContext);
		return createNatureResult('rock', daasContext, malchusValue, {
			faceCount: malchusValue.mesh.faces.length,
			materialRole: malchusValue.material.role,
			profile: malchusValue.profile.id,
			remoteMaterial: malchusValue.material.remote
		});
	}

	/**
	 * Creates a canonical Nature operation context for one inert-nature request.
	 * @param {object} options Per-call overrides.
	 * @param {string} domain Stable operation domain.
	 * @param {string} identity Stable caller-visible object identity.
	 * @returns {object} Frozen deterministic operation context.
	 */
	context(options, domain, identity) {
		return createNatureCallContext(this.defaults, options, domain, identity);
	}
}
