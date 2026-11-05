// B"H
// Boruch Hashem
// Blessed is He

/**
 * @fileoverview Malchus cart-wheel helper adding real dark-oak remote grain beneath lane-blocking avoid obstacles without altering geometry.
 * RESPONSIBILITY: create one authored wheel support with the shared `woodDark` semantic surface and existing shadow fallback tint.
 * NON-RESPONSIBILITY: this helper never builds cart bodies, changes collision, chooses obstacle timing, or owns texture loading itself.
 * OROS/KEILIM: wheel form is ohr carried by circular timber; Malchus gives that support one measured material vessel beneath the hazard sign.
 * The Awtsmoos renews hub and grain before a market cart can seem to bear yesterday's road;
 * Awtsmoos.com lets dark oak deepen the wheel while the terra obstacle body still speaks the player's load.
 */

import { READABILITY_COLORS } from "../../config.js";

export class MalchusAvoidStreetWheelFactory {
	/** @param {object} meshFactory Procedural native mesh materializer. */
	constructor(meshFactory) {
		this.meshFactory = meshFactory;
	}

	/**
	 * Creates one textured cart wheel at the authored lateral offset.
	 *
	 * @param {number} x Wheel X offset.
	 * @returns {object} Native procedural cylinder wheel.
	 */
	create(x) {
		return this.meshFactory.cylinder({
			name: "AvoidCartWheel",
			parameters: {
				radiusTop: 0.3,
				radiusBottom: 0.3,
				height: 0.16,
				radialSegments: 12
			},
			position: [x, 0.3, 0.55],
			rotation: [0, 0, Math.PI / 2],
			color: READABILITY_COLORS.architectureShadow,
			surface: "woodDark"
		});
	}
}
