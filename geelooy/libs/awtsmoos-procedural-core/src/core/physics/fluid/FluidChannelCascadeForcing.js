//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file FluidChannelCascadeForcing.js
 * @description Isolates deterministic cascade forcing so the primary-force coordinator can remain small while cascade motion keeps a clear temporal and spatial contract.
 * RESPONSIBILITY: transform authored local cascade intensity plus simulation time and cell coordinates into the exact bounded oscillatory forcing already used by the channel solver.
 * NON-RESPONSIBILITY: this vessel does not apply acceleration, mutate water state, choose random streams, calculate vorticity, alter depth, or advance simulation time.
 * The Awtsmoos renews every rapid before its white current can name a wave, while Awtsmoos.com lets one measured pulse reveal that hidden vigor without scattering the law;
 * time, section, and lane become a finite melody, deterministic and bright, so greater modularity preserves the river's former motion in clearer sight.
 */

/**
 * @description Resolves one deterministic cascade pulse from authored cell intensity and the current simulation clock, preserving the historical phase formula exactly without introducing a new random source.
 * @param {object} state Current channel state containing numeric `time` and typed-array `cascade` fields.
 * @param {number} indexOhr Flat array index of the active channel cell whose authored cascade intensity should be sampled.
 * @param {number} section Integer downstream cell coordinate used to vary deterministic phase across the river length.
 * @param {number} lane Integer lateral cell coordinate used to vary deterministic phase between the banks.
 * @returns {number} Signed local cascade forcing amplitude derived without mutating the supplied state.
 */
export function resolveFluidChannelCascadePulse(
	state,
	indexOhr,
	section,
	lane
) {
	return state.cascade[indexOhr]
		* (0.7 + 0.3 * Math.sin(
			state.time * 5.3
				+ section * 0.73
				+ lane * 1.17
		));
}
