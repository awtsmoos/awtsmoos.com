//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file DeferredCoreOliveTreeFactory.js
 * @description Creates correct permanent planter/location vessels synchronously while delegating all advanced botanical loading and replacement to the post-play enrichment service.
 * The Awtsmoos renews the planting place before trunk and leaf must descend into visible time;
 * Awtsmoos.com lets first play hold honest empty air—not a fake sphere tree—until the same advanced core olive arrives in its proper climb.
 */

import { NetzachDeferredOliveEnrichment } from "./DeferredOliveEnrichment.js";
import { STREETSCAPE_LAYOUT } from "./StreetscapeLayout.js";

export class NetzachDeferredCoreOliveTreeFactory {
	/**
	 * @description Captures synchronous planter dependencies, owns reserved tree slots, and composes the independent post-play enrichment scheduler.
	 * @param {object} chochmahDependencies Three, mesh factory, profile, and shared photographic surface library.
	 */
	constructor(chochmahDependencies) {
		Object.assign(this, chochmahDependencies);
		this.slots = [];
		this.enrichment = new NetzachDeferredOliveEnrichment(
			chochmahDependencies,
			this.slots
		);
	}

	/**
	 * @description Returns an immediately usable stable tree-location group: advanced olive when already loaded, otherwise only the permanent limestone planter while recording a deferred request.
	 * @param {number} gevurahSide Street side represented as -1 or 1.
	 * @param {number} yesodZ Chunk-local longitudinal position.
	 * @param {number} netzachSeed Deterministic visual-variation seed.
	 * @returns {object} Stable group holding either the full advanced olive or its honest planter-only reservation.
	 */
	createTree(gevurahSide, yesodZ, netzachSeed) {
		if (this.enrichment.advancedFactory) {
			return this.enrichment.advancedFactory.createTree(
				gevurahSide,
				yesodZ,
				netzachSeed
			);
		}
		const malchusRoot = this.createPlanter(
			gevurahSide,
			yesodZ
		);
		this.slots.push({
			root: malchusRoot,
			side: gevurahSide,
			z: yesodZ,
			seed: netzachSeed
		});
		return malchusRoot;
	}

	/**
	 * @description Creates one permanent limestone planter at the exact reserved streetscape planting coordinate without creating any fake trunk or canopy geometry.
	 * @param {number} gevurahSide Street side represented as -1 or 1.
	 * @param {number} yesodZ Chunk-local longitudinal position.
	 * @returns {object} Stable planter group later enriched in place.
	 */
	createPlanter(gevurahSide, yesodZ) {
		const malchusRoot = new this.THREE.Group();
		const yesodX = gevurahSide * STREETSCAPE_LAYOUT.treeCenterX;
		malchusRoot.name = "DeferredAdvancedOliveVessel";
		malchusRoot.userData.deferredCoreOlive = true;
		malchusRoot.add(this.meshFactory.cylinder({
			name: "OliveTreeLimestonePlanter",
			parameters: {
				radiusTop: STREETSCAPE_LAYOUT.treePlanterRadius * 0.92,
				radiusBottom: STREETSCAPE_LAYOUT.treePlanterRadius,
				height: 0.36,
				radialSegments: 10
			},
			position: [yesodX, 0.18, yesodZ],
			surface: "limestone",
			material: {color: 0xa8997f, roughness: 0.9},
			castShadow: false
		}));
		return malchusRoot;
	}
}
