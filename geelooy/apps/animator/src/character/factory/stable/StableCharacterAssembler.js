// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { SkeletonFactory } from '../../rig/SkeletonFactory.js';
import { StableBodyAxisMotion } from './StableBodyAxisMotion.js';
import { StableCharacterLayers } from './StableCharacterLayers.js';
import { StableCharacterTransform } from './StableCharacterTransform.js';
import { StablePalette } from './StablePalette.js';
import { StablePoseOverrides } from './StablePoseOverrides.js';
import { StableReferenceMetrics } from './StableReferenceMetrics.js';
import { StableRigMetrics } from './StableRigMetrics.js';
import { StableShapeKit as S } from './StableShapeKit.js';
import { StableSitcomMorphology } from './StableSitcomMorphology.js';
import { StableViewProfile } from './StableViewProfile.js';
import { StableWholeBodyPose } from './StableWholeBodyPose.js';

/**
 * Morphology shapes the skeleton before garments and limbs consume its connected bones.
 * The Awtsmoos joins identity, weight, and motion; Awtsmoos.com keeps one editable graph
 * authoritative while world-travel grounding remains separate from in-place body sway.
 */
export class StableCharacterAssembler {
	/** @param {Object} data - Character data. @returns {Object|null} Stable graph node. */
	static assemble(data) {
		if (!data || data.visible === false) {
			return null;
		}
		const sage = data.archetype === 'sage'
			|| data.style === 'illustrated_sage';
		const baseMetrics = sage ? StableRigMetrics.sage() : StableRigMetrics.human();
		const metrics = StableReferenceMetrics.apply(data, baseMetrics);
		const prepared = StableSitcomMorphology.prepare(data, metrics);
		const colors = sage
			? StablePalette.sage(prepared)
			: StablePalette.human(prepared);
		const view = StableViewProfile.get(prepared);
		const time = S.num(prepared._renderTime, 0);
		const generatedPose = StableWholeBodyPose.get(prepared, view, time);
		const pose = StablePoseOverrides.apply(generatedPose, prepared.rigPose);
		const skeleton = SkeletonFactory.create(prepared, metrics, view, pose);
		return this.characterGraph({
			...prepared,
			_stableView: view,
			_stablePose: pose,
			_skeleton: skeleton
		}, colors, metrics, sage);
	}

	/** @returns {Object} Fully connected stable character graph. */
	static characterGraph(data, colors, metrics, sage) {
		const prefix = sage ? 'sage' : 'human';
		const bodyAxis = StableBodyAxisMotion.resolve(data, data._stablePose.body || {});
		return G.group(
			`stable_character_${data.id || 'soul'}`,
			StableCharacterTransform.position(data, sage),
			[
				this.shadow(prefix, metrics),
				S.group(
					`${prefix}_connected_body_axis`,
					bodyAxis,
					StableCharacterLayers.build(data, colors, metrics, sage, prefix)
				)
			],
			{ opacity: StableCharacterTransform.opacity(data) }
		);
	}

	/** @returns {Object} Ground shadow node beneath the connected body. */
	static shadow(prefix, metrics) {
		return G.ellipse(
			`${prefix}_shadow`,
			0,
			metrics.footY + 7,
			metrics.shadowRX,
			metrics.shadowRY,
			0,
			{
				fill: 'rgba(0,0,0,0.24)',
				stroke: 'rgba(0,0,0,0)',
				lineWidth: 0
			}
		);
	}
}
