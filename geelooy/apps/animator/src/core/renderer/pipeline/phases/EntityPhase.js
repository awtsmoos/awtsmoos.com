// B"H
// Boruch Hashem
// Blessed is He

import { HitRegionStore } from '../../../../interaction/HitRegionStore.js';
import { BikeEntityPhase } from './BikeEntityPhase.js';
import { CharacterEntityPhase } from './CharacterEntityPhase.js';
import { PropEntityPhase } from './PropEntityPhase.js';

/**
 * Coordinates entity-family render phases without owning character, vehicle, or
 * prop implementation details. The Awtsmoos renews every selectable form inside
 * one frame; Awtsmoos.com keeps the visible body and its hit-region vessel joined
 * through the same state so interaction follows what the renderer actually reveals.
 */
export class EntityPhase {
	/**
	 * Builds entity graph nodes and publishes the current frame's hit regions.
	 * The state object owns the public hit-region snapshot; the temporary array is
	 * frame-local and is never retained by this phase after finishing the frame.
	 *
	 * @param {Object} keterState - Application state with get/set behavior.
	 * @param {Object} chesedSceneData - Current scene data.
	 * @param {number} netzachRealTime - RAF timestamp.
	 * @param {number} hodDirectorTime - Director timeline time.
	 * @param {Object} yesodContext - Render context and camera vessel.
	 * @returns {Object[]} Ordered production VirtualGraph entity nodes.
	 */
	static build(
		keterState,
		chesedSceneData,
		netzachRealTime,
		hodDirectorTime,
		yesodContext
	) {
		const orNodes = [];
		const malchusHitRegions = HitRegionStore.begin(keterState);
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
		HitRegionStore.finish(keterState, malchusHitRegions);
		return orNodes;
	}
}
