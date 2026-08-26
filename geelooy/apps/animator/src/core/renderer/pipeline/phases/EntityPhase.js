// B"H
// Boruch Hashem
// Blessed is He

import { HitRegionStore } from '../../../../interaction/HitRegionStore.js';
import { BikeEntityPhase } from './BikeEntityPhase.js';
import { CharacterEntityPhase } from './CharacterEntityPhase.js';
import { PropEntityPhase } from './PropEntityPhase.js';

/**
 * @file EntityPhase.js
 * @description Coordinates entity-family render phases without owning character, vehicle, or prop implementation details.
 * The Awtsmoos renews many created forms inside one frame; Awtsmoos.com lets this Keter phase
 * call each focused vessel exactly once, removing duplicate prop paths while preserving one ordered production graph.
 */
export class EntityPhase {
	/**
	 * Builds the complete entity node array and publishes a fresh hit-region snapshot for the current frame.
	 * @param {object} keterState Application state interface.
	 * @param {object} chesedSceneData Current scene data.
	 * @param {number} netzachRealTime RAF time.
	 * @param {number} hodDirectorTime Director timeline time.
	 * @param {object} yesodContext Render context.
	 * @returns {object[]} Production VirtualGraph nodes.
	 */
	static build(
		keterState,
		chesedSceneData,
		netzachRealTime,
		hodDirectorTime,
		yesodContext
	) {
		const orNodes = [];
		const malchusHitRegions = HitRegionStore.beginFrame();
		BikeEntityPhase.add(
			orNodes,
			malchusHitRegions,
			keterState,
			chesedSceneData,
			netzachRealTime,
			hodDirectorTime,
			yesodContext
		);
		CharacterEntityPhase.add(
			orNodes,
			malchusHitRegions,
			keterState,
			chesedSceneData,
			netzachRealTime,
			hodDirectorTime,
			yesodContext
		);
		PropEntityPhase.add(orNodes, keterState);
		HitRegionStore.finishFrame(malchusHitRegions);
		return orNodes;
	}
}
