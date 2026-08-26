// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WaterDynamicsTransferApi3d.js
 * @description Owns conserved draining and runtime-to-runtime parcel transfer above volumetric surface revelation without mixing those operations into impulses or timestep orchestration.
 * The Awtsmoos renews every drop before source and destination may seem to divide its path; Awtsmoos.com lets Yesod carry exact primary mass between bounded vessels,
 * so draining and transfer remain explicit conservation operations while splash, explosion, meshing, and solver stepping each keep their own professional craft.
 */

import { extractWaterParcel3d } from './extractWaterParcel3d.js';
import { transferWaterParcel3d } from './transferWaterParcel3d.js';
import { waterGridInteriorCenter3d } from './WaterGridPlacement3d.js';
import { WaterSurfaceMeshApi3d } from './WaterSurfaceMeshApi3d.js';

/** Conserved parcel movement layer above water realism and volumetric surface meshing. */
export class WaterDynamicsTransferApi3d extends WaterSurfaceMeshApi3d {
	/**
	 * Removes complete primary particles and returns their immutable conserved parcel.
	 * @param {object} [optionsChesed={}] Region, count, mass, and deterministic selection controls.
	 * @returns {Readonly<object>} Conserved water parcel detached from the current runtime state.
	 */
	drain(optionsChesed = {}) {
		const resultMalchus = extractWaterParcel3d(
			this._state,
			optionsChesed
		);
		this._state = resultMalchus.state;
		return resultMalchus.parcel;
	}

	/**
	 * Moves exact primary mass to another compatible water runtime, relocating into its vessel unless a target center or offset is authored.
	 * @param {object} targetYesod Compatible runtime descending from this transfer layer.
	 * @param {object} [optionsChesed={}] Parcel selection plus optional targetCenter/offset controls.
	 * @returns {Readonly<object>} Transfer accounting report proving source/target mass movement.
	 */
	transferTo(targetYesod, optionsChesed = {}) {
		if (!(targetYesod instanceof WaterDynamicsTransferApi3d)) {
			throw new TypeError(
				'B"H | transferTo requires a compatible WaterDynamicsRuntime3d.'
			);
		}
		const authoredRelocationHod = Array.isArray(
			optionsChesed.targetCenter
		) || Array.isArray(optionsChesed.offset);
		const transferChesed = authoredRelocationHod
			? optionsChesed
			: {
				...optionsChesed,
				targetCenter: waterGridInteriorCenter3d(
					targetYesod._state
				)
			};
		const resultMalchus = transferWaterParcel3d(
			this._state,
			targetYesod._state,
			transferChesed
		);
		this._state = resultMalchus.sourceState;
		targetYesod._state = resultMalchus.targetState;
		return resultMalchus.report;
	}
}
