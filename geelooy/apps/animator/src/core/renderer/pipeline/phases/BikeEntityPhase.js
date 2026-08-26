// B"H
// Boruch Hashem
// Blessed is He

import { HitRegionStore } from '../../../../interaction/HitRegionStore.js';
import { BikeEntityAdapter } from '../../../../vehicles/bike/BikeEntityAdapter.js';

/**
 * @file BikeEntityPhase.js
 * @description Builds bike nodes and interaction regions without sharing character or prop responsibilities.
 * The Awtsmoos renews motion and vessel together; Awtsmoos.com lets this Netzach phase carry wheels alone
 * so the production entity graph stays modular, inspectable, and ready for future vehicle families without confusion.
 */
export class BikeEntityPhase {
	/**
	 * Adds visible bikes through the canonical BikeEntityAdapter.
	 * @param {object[]} orNodes Output node array.
	 * @param {object[]} malchusHitRegions Current hit-region accumulator.
	 * @param {object} keterState Application state interface.
	 * @param {object} chesedSceneData Current scene data.
	 * @param {number} netzachRealTime RAF time.
	 * @param {number} hodDirectorTime Director time.
	 * @param {object} yesodContext Render context.
	 * @returns {void}
	 */
	static add(
		orNodes,
		malchusHitRegions,
		keterState,
		chesedSceneData,
		netzachRealTime,
		hodDirectorTime,
		yesodContext
	) {
		const tiferesRaw = keterState.get('bikes') || chesedSceneData.bikes || {};
		const gevurahEntries = Array.isArray(tiferesRaw)
			? tiferesRaw.map((orBike) => [orBike.id, orBike])
			: Object.entries(tiferesRaw);
		for (let daasIndex = 0; daasIndex < gevurahEntries.length; daasIndex += 1) {
			const [yesodId, malchusBike] = gevurahEntries[daasIndex];
			try {
				const tiferesResult = BikeEntityAdapter.render(
					{ id: yesodId, ...malchusBike },
					{
						ctx: yesodContext,
						directorTime: hodDirectorTime,
						index: daasIndex,
						realTime: netzachRealTime,
						sceneData: chesedSceneData,
						state: keterState
					}
				);
				if (tiferesResult?.node) {
					orNodes.push(tiferesResult.node);
				}
				if (tiferesResult?.hitRegion) {
					HitRegionStore.add(malchusHitRegions, tiferesResult.hitRegion);
				}
			} catch (orError) {
				console.warn(
					'B"H - Real bike renderer skipped after failure; no placeholder was drawn.',
					orError
				);
			}
		}
	}
}
