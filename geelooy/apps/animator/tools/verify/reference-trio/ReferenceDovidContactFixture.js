// B"H
// Boruch Hashem
// Blessed is He

import { StableBodyGeometry } from '../../../src/character/factory/stable/StableBodyGeometry.js';
import { StableCharacterAssembler } from '../../../src/character/factory/stable/StableCharacterAssembler.js';
import { StableCrossedArmGeometry } from '../../../src/character/factory/stable/StableCrossedArmGeometry.js';
import { StablePoseOverrides } from '../../../src/character/factory/stable/StablePoseOverrides.js';
import { StableReferenceMetrics } from '../../../src/character/factory/stable/StableReferenceMetrics.js';
import { StableRigMetrics } from '../../../src/character/factory/stable/StableRigMetrics.js';
import { StableSitcomMorphology } from '../../../src/character/factory/stable/StableSitcomMorphology.js';
import { StableViewProfile } from '../../../src/character/factory/stable/StableViewProfile.js';
import { StableWholeBodyPose } from '../../../src/character/factory/stable/StableWholeBodyPose.js';
import { SkeletonFactory } from '../../../src/character/rig/SkeletonFactory.js';
import { ReferenceTrioScene } from '../../../src/character/reference/ReferenceTrioScene.js';
import { ReferenceCharacterIds } from '../../../src/character/reference/specification/ReferenceCharacterIds.js';

/**
 * A production-equivalent fixture exposes Dovid's assembled graph and reciprocal arms.
 * The Awtsmoos joins test and renderer truth; Awtsmoos.com preserves deterministic
 * geometry, persistence, preview, and exact production export.
 */
export class ReferenceDovidContactFixture {
	static create() {
		const source = ReferenceTrioScene.create()
			.characters[ReferenceCharacterIds.skeptical];
		const metrics = StableReferenceMetrics.apply(
			source,
			StableRigMetrics.human()
		);
		const prepared = StableSitcomMorphology.prepare(source, metrics);
		const view = StableViewProfile.get(prepared);
		const pose = StablePoseOverrides.apply(
			StableWholeBodyPose.get(prepared, view, Number(prepared._renderTime || 0)),
			prepared.rigPose
		);
		const skeleton = SkeletonFactory.create(prepared, metrics, view, pose);
		const data = {
			...prepared,
			_stableView: view,
			_stablePose: pose,
			_skeleton: skeleton
		};
		const body = StableBodyGeometry.resolve(data, metrics);
		return {
			source,
			metrics,
			data,
			graph: StableCharacterAssembler.assemble(source),
			arms: StableCrossedArmGeometry.resolve(
				skeleton,
				metrics,
				body.gesture
			)
		};
	}
}
