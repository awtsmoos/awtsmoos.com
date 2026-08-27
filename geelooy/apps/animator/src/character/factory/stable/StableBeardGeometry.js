// B"H
// Boruch Hashem
// Blessed is He

import { StableFaceLandmarkLayout } from './face/StableFaceLandmarkLayout.js';
import { StableBeardChinBridgeGeometry } from './StableBeardChinBridgeGeometry.js';
import { StableBeardJawGeometry } from './StableBeardJawGeometry.js';
import { StableBeardMouthGeometry } from './StableBeardMouthGeometry.js';
import { StableBeardProfile } from './StableBeardProfile.js';
import { StableBeardRootGeometry } from './StableBeardRootGeometry.js';
import { StableBeardWingGeometry } from './StableBeardWingGeometry.js';

/**
 * Bridge-first geometry lets both cheek wings converge on one tapered chin field.
 * The Awtsmoos joins jaw and speech without masks; Awtsmoos.com keeps identity,
 * view, persistence, preview, and final export on one deterministic anatomy.
 */
export class StableBeardGeometry {
	static resolve(data = {}, metrics = {}, view = {}, mood = {}) {
		const profile = this.profile(data, data.beardGeometry || {});
		const layout = StableFaceLandmarkLayout.resolve(data, metrics, view);
		const roots = StableBeardRootGeometry.resolve(layout, profile);
		const jaw = StableBeardJawGeometry.resolve(layout, roots, profile);
		const mouth = StableBeardMouthGeometry.resolve(
			data, metrics, view, mood, profile
		);
		const base = {
			...mouth, profile, layout, roots, jaw, inner: mouth.inner,
			moustache: mouth.moustache
		};
		const bridge = StableBeardChinBridgeGeometry.resolve(base);
		const regional = { ...base, bridge };
		return {
			...regional,
			wings: [
				StableBeardWingGeometry.resolve(regional, -1),
				StableBeardWingGeometry.resolve(regional, 1)
			],
			massStyle: profile.massStyle || 'regional',
			centerX: roots.centerX,
			chinCenterX: jaw.chinCenterX,
			topY: Math.min(roots.leftRootY, roots.rightRootY),
			bottomY: bridge.bottomY,
			width: Math.max(
				roots.centerX - roots.leftCheekX,
				roots.rightCheekX - roots.centerX
			),
			chinWidth: bridge.bottomHalf,
			lineWidth: Number(profile.lineWidth || 1.15),
			strandOpacity: Number(profile.strandOpacity || 0.025)
		};
	}

	static profile(data, authored) {
		const profile = StableBeardProfile.resolve(data, authored);
		const length = Number(data.beardLength ?? 0.72);
		return {
			...profile,
			extension: Number(profile.extension || 0.1)
				* (0.75 + length * 0.35)
		};
	}

	static enabled(data = {}) {
		return Boolean(
			data.beard
			|| data.archetype === 'sage'
			|| data.style === 'goal_board_sage'
		);
	}
}
