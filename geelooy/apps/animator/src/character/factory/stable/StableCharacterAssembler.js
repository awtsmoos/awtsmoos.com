// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { SkeletonFactory } from '../../rig/SkeletonFactory.js';
import { StableAccessories2D } from './StableAccessories2D.js';
import { StableBody2D } from './StableBody2D.js';
import { StableFace2D } from './StableFace2D.js';
import { StableHair2D } from './StableHair2D.js';
import { StableLimbs2D } from './StableLimbs2D.js';
import { StablePalette } from './StablePalette.js';
import { StableReferenceMetrics } from './StableReferenceMetrics.js';
import { StableRigMetrics } from './StableRigMetrics.js';
import { StableShapeKit as S } from './StableShapeKit.js';
import { StableViewProfile } from './StableViewProfile.js';
import { StableWholeBodyPose } from './StableWholeBodyPose.js';

/**
 * The Awtsmoos joins identity, skeleton, performance, and paint in one living
 * graph. Awtsmoos.com keeps reference proportions editable while every frame
 * still flows through the production renderer, timeline, persistence, and export.
 */
export class StableCharacterAssembler {
	static assemble(data) {
		if (!data) {
			return null;
		}
		const sage = data.archetype === 'sage' || data.style === 'illustrated_sage';
		const baseMetrics = sage ? StableRigMetrics.sage() : StableRigMetrics.human();
		const metrics = StableReferenceMetrics.apply(data, baseMetrics);
		const colors = sage ? StablePalette.sage(data) : StablePalette.human(data);
		const view = StableViewProfile.get(data);
		const time = S.num(data._renderTime, 0);
		const pose = StableWholeBodyPose.get(data, view, time);
		const skeleton = SkeletonFactory.create(data, metrics, view, pose);
		const renderData = {
			...data,
			_stableView: view,
			_stablePose: pose,
			_skeleton: skeleton
		};
		return this.characterGraph(renderData, colors, metrics, sage);
	}

	static characterGraph(data, colors, metrics, sage) {
		const prefix = sage ? 'sage' : 'human';
		const poseBody = data._stablePose.body || {};
		const breath = S.clamp(poseBody.torsoBreathScale || 1, 0.96, 1.05);
		return S.group(`stable_character_${data.id || 'soul'}`, this.position(data, sage), [
			G.ellipse(`${prefix}_shadow`, 0, metrics.footY + 7, metrics.shadowRX, metrics.shadowRY, 0, {
				fill: 'rgba(0,0,0,0.24)',
				stroke: 'rgba(0,0,0,0)',
				lineWidth: 0
			}),
			S.group(`${prefix}_connected_body_axis`, {
				x: (poseBody.hipX || 0) * 0.08,
				y: S.clamp(poseBody.bob || 0, -13, 8),
				scaleY: breath,
				rotation: (poseBody.torsoLean || 0) * 0.006
			}, this.layers(data, colors, metrics, sage, prefix))
		]);
	}

	static layers(data, colors, metrics, sage, prefix) {
		const skeleton = data._skeleton;
		const poseBody = data._stablePose.body || {};
		return [
			StableHair2D.back(data, colors, metrics, data._renderTime, data._stableView),
			StableLimbs2D.legs(data, colors, metrics, prefix, data._stableView),
			StableLimbs2D.backArm(data, colors, metrics, prefix, data._stableView),
			sage ? StableBody2D.sage(data, colors, metrics, data._stableView) : StableBody2D.human(data, colors, metrics, data._stableView),
			S.group(`${prefix}_head_axis`, {
				x: skeleton.head.x * 0.05,
				y: Number(poseBody.headNod || 0) + Number(data.renderPerformance?.body?.headOffsetY || 0) * 0.45,
				rotation: Number(poseBody.headRotation || 0)
			}, [
				sage ? StableFace2D.sage(data, colors, metrics, data._stableView) : StableFace2D.human(data, colors, metrics, data._stableView),
				StableHair2D.front(data, colors, metrics, data._renderTime, data._stableView),
				StableAccessories2D.build(data, colors, metrics, data._stableView)
			]),
			StableLimbs2D.frontArm(data, colors, metrics, prefix, data._stableView)
		];
	}

	static position(data, sage) {
		const position = data.position || {};
		const scale = S.clamp(Math.abs(S.num(position.scale ?? data.scale, sage ? 0.82 : 0.86)), 0.24, 2.4);
		return {
			x: S.num(position.x ?? data.x, 0),
			y: S.num(position.y ?? data.y, 0),
			scaleX: scale,
			scaleY: scale,
			rotation: 0
		};
	}
}
