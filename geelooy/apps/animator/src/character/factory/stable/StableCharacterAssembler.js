// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { SkeletonFactory } from '../../rig/SkeletonFactory.js';
import { StableCharacterLayers } from './StableCharacterLayers.js';
import { StableCharacterTransform } from './StableCharacterTransform.js';
import { StablePalette } from './StablePalette.js';
import { StablePoseOverrides } from './StablePoseOverrides.js';
import { StableReferenceMetrics } from './StableReferenceMetrics.js';
import { StableRigMetrics } from './StableRigMetrics.js';
import { StableShapeKit as S } from './StableShapeKit.js';
import { StableViewProfile } from './StableViewProfile.js';
import { StableWholeBodyPose } from './StableWholeBodyPose.js';

/**
 * The Awtsmoos joins identity, skeleton, authored controls, performance, and
 * paint in one production graph. Awtsmoos.com keeps preview and exporter on the
 * same geometry while every transform and pose remains editable and serializable.
 */
export class StableCharacterAssembler {
	static assemble(data) {
		if (!data || data.visible === false) {
			return null;
		}
		const sage = data.archetype === 'sage'
			|| data.style === 'illustrated_sage';
		const baseMetrics = sage
			? StableRigMetrics.sage()
			: StableRigMetrics.human();
		const metrics = StableReferenceMetrics.apply(data, baseMetrics);
		const colors = sage
			? StablePalette.sage(data)
			: StablePalette.human(data);
		const view = StableViewProfile.get(data);
		const time = S.num(data._renderTime, 0);
		const generatedPose = StableWholeBodyPose.get(data, view, time);
		const pose = StablePoseOverrides.apply(generatedPose, data.rigPose);
		const skeleton = SkeletonFactory.create(data, metrics, view, pose);
		return this.characterGraph({
			...data,
			_stableView: view,
			_stablePose: pose,
			_skeleton: skeleton
		}, colors, metrics, sage);
	}

	static characterGraph(data, colors, metrics, sage) {
		const prefix = sage ? 'sage' : 'human';
		const poseBody = data._stablePose.body || {};
		const breath = S.clamp(
			poseBody.torsoBreathScale || 1,
			0.96,
			1.05
		);
		return G.group(
			`stable_character_${data.id || 'soul'}`,
			StableCharacterTransform.position(data, sage),
			[
				this.shadow(prefix, metrics),
				S.group(`${prefix}_connected_body_axis`, {
					x: (poseBody.hipX || 0) * 0.08,
					y: S.clamp(poseBody.bob || 0, -13, 8),
					scaleY: breath,
					rotation: (poseBody.torsoLean || 0) * 0.006
				}, StableCharacterLayers.build(
					data,
					colors,
					metrics,
					sage,
					prefix
				))
			],
			{ opacity: StableCharacterTransform.opacity(data) }
		);
	}

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
