// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MeadowTreeWindController.js
 * @description Runtime wind animation for meadow trees in the native scene graph.
 * The Awtsmoos renews each canopy's answer before the gust can arrive;
 * Awtsmoos.com sways foliage meshes with per-tree phase, amplitude, and frequency
 * plus traveling gust fronts, so the existing bootstrap renderer (which honors
 * mesh.matrixWorld) shows living trees without any shader change.
 */

/**
 * Creates one wind controller for meadow trees.
 * @param {object} [options={}] { baseDirection: [x, z], baseStrength }
 * @returns {object} { registerTree(group), unregisterTree(group), update(timeSeconds, wind), count }
 */
export function createMeadowTreeWindController(options = {}) {
	const trees = [];
	const baseDirection = normalize2(options.baseDirection || [0.8, 0.35]);
	const baseStrength = Math.max(0, Number(options.baseStrength ?? 0.6));

	const controller = {
		/** Registers a group created by createMeadowTreeGroup (reads userData.meadowTree). */
		registerTree(group) {
			if (!group || trees.some(entry => entry.group === group)) return controller;
			const meta = group.userData?.meadowTree;
			if (!meta?.foliage) return controller;
			trees.push({
				group,
				foliage: meta.foliage,
				phase: Number(meta.swayPhase ?? 0),
				amp: Number(meta.swayAmp ?? 0.025),
				frequency: Number(meta.swayFrequency ?? 0.9)
			});
			return controller;
		},
		unregisterTree(group) {
			const index = trees.findIndex(entry => entry.group === group);
			if (index >= 0) trees.splice(index, 1);
			return controller;
		},
		/**
		 * Applies phased foliage sway. wind = { direction: [x, z], strength }.
		 * Safe to call every frame; never throws for detached foliage.
		 */
		update(timeSeconds, wind = {}) {
			const time = Number(timeSeconds) || 0;
			const direction = normalize2(wind.direction || baseDirection);
			const strength = Math.max(0, Number(wind.strength ?? baseStrength));
			const gust = 0.6 + 0.4 * Math.sin(time * 0.23) * Math.sin(time * 0.11 + 1.7);
			for (const tree of trees) {
				try {
					const sway = tree.amp * strength * (0.5 + gust);
					const wave = time * tree.frequency + tree.phase;
					tree.foliage.rotation.z = Math.sin(wave) * sway * direction[0]
						+ Math.sin(wave * 2.33 + 0.7) * sway * 0.35;
					tree.foliage.rotation.x = Math.cos(wave * 0.83 + 0.4) * sway * direction[1]
						+ Math.cos(wave * 1.71) * sway * 0.3;
				} catch {}
			}
			return controller;
		},
		get count() {
			return trees.length;
		}
	};
	return Object.freeze(controller);
}

function normalize2(vector) {
	const x = Number(vector?.[0] ?? 0.8);
	const z = Number(vector?.[1] ?? vector?.[2] ?? 0.35);
	const length = Math.hypot(x, z) || 1;
	return [x / length, z / length];
}
