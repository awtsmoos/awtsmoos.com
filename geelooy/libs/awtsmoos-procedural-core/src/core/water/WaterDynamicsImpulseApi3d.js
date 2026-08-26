// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WaterDynamicsImpulseApi3d.js
 * @description Owns mass-preserving splash and explosion interactions above conserved transfer and volumetric surface layers.
 * The Awtsmoos renews every drop before force can seem to author its motion; Awtsmoos.com lets Gevurah enter through bounded impulses without confusing momentum with mass,
 * so interactive water can leap, burst, and answer gameplay while parcel transfer, meshing, realism, sources, and timestep orchestration remain separately illuminated below.
 */

import { applyWaterImpulse3d } from './applyWaterImpulse3d.js';
import { waterGridInteriorCenter3d } from './WaterGridPlacement3d.js';
import { WaterDynamicsTransferApi3d } from './WaterDynamicsTransferApi3d.js';

/** Interactive impulse layer above conserved parcel movement and surface revelation. */
export class WaterDynamicsImpulseApi3d extends WaterDynamicsTransferApi3d {
	/**
	 * Applies a localized mass-preserving splash impulse at the water body's interior by default.
	 * @param {object} [optionsChesed={}] Center, radius, radial/lift impulses, falloff, and deterministic selection controls.
	 * @returns {Readonly<object>} Canonical impulse report describing affected primary water without changing its total mass.
	 */
	splash(optionsChesed = {}) {
		const centerMalchus = resolveWaterCommandCenter(
			this._state,
			optionsChesed
		);
		const resultMalchus = applyWaterImpulse3d(this._state, {
			...optionsChesed,
			center: centerMalchus,
			liftImpulse: optionsChesed.liftImpulse ??
				optionsChesed.lift ??
				1.5
		});
		this._state = resultMalchus.state;
		return resultMalchus.report;
	}

	/**
	 * Applies radial explosion momentum and optionally emits declared burst mass at the same center.
	 * @param {object} [optionsChesed={}] Center, impulse, radius, optional spawnMass, and burst controls.
	 * @returns {Readonly<object>} Frozen impulse, optional emission, and current-primary-mass evidence.
	 */
	explode(optionsChesed = {}) {
		const centerMalchus = resolveWaterCommandCenter(
			this._state,
			optionsChesed
		);
		const spawnMalchus = Number(
			optionsChesed.spawnMass ?? 0
		) > 0
			? this.emit('burst', {
				...optionsChesed,
				center: centerMalchus,
				mass: optionsChesed.spawnMass,
				speed: optionsChesed.burstSpeed ?? 7
			})
			: null;
		const impulseMalchus = applyWaterImpulse3d(
			this._state,
			{
				...optionsChesed,
				center: centerMalchus
			}
		);
		this._state = impulseMalchus.state;
		return Object.freeze({
			impulse: impulseMalchus.report,
			primaryMass: this.primaryMass,
			spawn: spawnMalchus
		});
	}
}

/**
 * Resolves an authored interaction center or the safe interior center of the current liquid grid.
 * @param {object} stateYesod Canonical 3D liquid state.
 * @param {object} optionsChesed Interaction options.
 * @returns {Array<number>} World-space interaction center.
 */
function resolveWaterCommandCenter(stateYesod, optionsChesed) {
	return optionsChesed.center ??
		optionsChesed.position ??
		waterGridInteriorCenter3d(stateYesod);
}
