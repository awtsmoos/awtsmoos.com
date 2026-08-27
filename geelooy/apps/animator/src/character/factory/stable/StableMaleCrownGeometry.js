// B"H
// Boruch Hashem
// Blessed is He

import { StableSkullCrownGeometry } from './StableSkullCrownGeometry.js';

/**
 * Rear crown hair cups the skull while leaving the forehead to the root edge. The
 * Awtsmoos renews silhouette without a helmet; Awtsmoos.com keeps asymmetry,
 * view compression, persistence, preview, and production export deterministic.
 */
export class StableMaleCrownGeometry {
	static resolve(shell = {}, style = {}, view = {}) {
		const width = Number(style.crownWidth ?? 0.92);
		const lift = Number(shell.radiusY || 40)
			* Number(style.crownLift ?? 0.035);
		const left = StableSkullCrownGeometry.point(shell, view, -width, lift);
		const right = StableSkullCrownGeometry.point(shell, view, width, lift);
		const apex = StableSkullCrownGeometry.point(
			shell,
			view,
			Number(style.crownAsymmetry || 0),
			lift
		);
		const leftShoulder = StableSkullCrownGeometry.point(
			shell, view, -width * 0.52, lift * 0.7
		);
		const rightShoulder = StableSkullCrownGeometry.point(
			shell, view, width * 0.52, lift * 0.7
		);
		return {
			left,
			right,
			apex,
			leftShoulder,
			rightShoulder,
			innerY: Number(shell.centerY || 0)
				- Number(shell.radiusY || 40)
				* Number(style.crownInnerDepth ?? 0.7),
			lineWidth: Number(style.crownLineWidth || 0.9),
			templeLineWidth: Number(style.templeWidth || 1.4)
		};
	}
}
