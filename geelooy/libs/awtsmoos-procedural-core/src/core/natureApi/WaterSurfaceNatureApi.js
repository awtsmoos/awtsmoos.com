// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WaterSurfaceNatureApi.js
 * @description Adds simulation-free and simulation-backed water surface language above canonical flow without owning any solver.
 * The Awtsmoos renews reflected sky and hidden depth before one runtime may call itself the sea; Awtsmoos.com lets Tiferes gather measured water evidence into one simple surface gate,
 * so beginners receive beautiful semantic water while experts may pass raw shallow, ocean, or PIC/FLIP vessels through the same covenant of light.
 */

import {
	createWaterSurfaceIntent,
	createWaterSurfaceSnapshot
} from '../water/surface/index.js';
import { createNatureCallContext } from './NatureApiOperation.js';
import {
	createNatureResult,
	unwrapNatureResult
} from './NatureApiResult.js';
import { WaterFlowNatureApi } from './WaterFlowNatureApi.js';

/** Surface-semantic water layer shared by cheap visual water and advanced physical regimes. */
export class WaterSurfaceNatureApi extends WaterFlowNatureApi {
	/**
	 * Creates convincing renderer-neutral water surface intent without allocating a fluid solver.
	 * @param {object} [optionsChesed={}] Material, preset, current, wave, optics, normal-detail, depth, time, and texture intent.
	 * @returns {Readonly<object>} Standard Nature result whose value is an immutable WaterSurfaceIntent.
	 */
	surface(optionsChesed = {}) {
		const contextBinah = createNatureCallContext(
			this.defaults,
			optionsChesed,
			'water',
			'surface'
		);
		const intentMalchus = createWaterSurfaceIntent({
			...optionsChesed,
			time: optionsChesed.time ?? 0
		});
		return createNatureResult(
			'water-surface-intent',
			contextBinah,
			intentMalchus,
			{
				material: intentMalchus.optics.material,
				preset: intentMalchus.preset,
				sourceKind: intentMalchus.sourceKind
			}
		);
	}

	/**
	 * Converts a Nature water result or raw expert source into one portable surface snapshot.
	 * @param {object} sourceYesod Nature result, surface intent, shallow runtime/state, ocean field, or 3D water runtime.
	 * @param {object} [optionsChesed={}] Sampling, material, wave, optics, normal-detail, current, depth, and time overrides.
	 * @returns {Readonly<object>} Standard Nature result containing a WaterSurfaceSnapshot.
	 */
	surfaceOf(sourceYesod, optionsChesed = {}) {
		const contextBinah = createNatureCallContext(
			this.defaults,
			optionsChesed,
			'water',
			'surface-snapshot'
		);
		const rawYesod = unwrapNatureResult(sourceYesod);
		const snapshotMalchus = createWaterSurfaceSnapshot(
			rawYesod,
			optionsChesed
		);
		return createNatureResult(
			'water-surface-snapshot',
			contextBinah,
			snapshotMalchus,
			{
				material: snapshotMalchus.intent.optics.material,
				sourceKind: snapshotMalchus.sourceKind,
				time: snapshotMalchus.time
			}
		);
	}
}
