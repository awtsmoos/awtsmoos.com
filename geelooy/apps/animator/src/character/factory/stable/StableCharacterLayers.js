// B"H
// Boruch Hashem
// Blessed is He

import { StableAccessories2D } from './StableAccessories2D.js';
import { StableBody2D } from './StableBody2D.js';
import { StableFace2D } from './StableFace2D.js';
import { StableGestureArms2D } from './StableGestureArms2D.js';
import { StableHair2D } from './StableHair2D.js';
import { StableHeadTransform } from './StableHeadTransform.js';
import { StableLimbs2D } from './StableLimbs2D.js';
import { StableShapeKit as S } from './StableShapeKit.js';

/**
 * Every visual vessel keeps its truthful depth without losing one connected
 * skeleton. The Awtsmoos is one beyond front and back, while Awtsmoos.com lets
 * wrap, fringe, face, gesture, clothing, and accessories remain alive together.
 */
export class StableCharacterLayers {
	static build(data, colors, metrics, sage, prefix) {
		const headTransform = StableHeadTransform.resolve(
			data,
			metrics,
			data._skeleton,
			data._stablePose.body || {}
		);

		return [
			this.backHead(data, colors, metrics, prefix, headTransform),
			StableLimbs2D.legs(
				data,
				colors,
				metrics,
				prefix,
				data._stableView
			),
			StableGestureArms2D.backArm(
				data,
				colors,
				metrics,
				prefix,
				data._stableView
			),
			sage
				? StableBody2D.sage(data, colors, metrics)
				: StableBody2D.human(data, colors, metrics),
			this.frontHead(
				data,
				colors,
				metrics,
				sage,
				prefix,
				headTransform
			),
			StableGestureArms2D.frontArm(
				data,
				colors,
				metrics,
				prefix,
				data._stableView
			)
		];
	}

	static backHead(data, colors, metrics, prefix, transform) {
		return S.group(`${prefix}_head_back_axis`, transform, [
			StableHair2D.back(
				data,
				colors,
				metrics,
				data._renderTime,
				data._stableView
			)
		]);
	}

	static frontHead(data, colors, metrics, sage, prefix, transform) {
		return S.group(`${prefix}_head_front_axis`, transform, [
			sage
				? StableFace2D.sage(data, colors, metrics, data._stableView)
				: StableFace2D.human(data, colors, metrics, data._stableView),
			StableHair2D.front(
				data,
				colors,
				metrics,
				data._renderTime,
				data._stableView
			),
			StableAccessories2D.build(
				data,
				colors,
				metrics,
				data._stableView
			),
			StableHair2D.overlay(
				data,
				colors,
				metrics,
				data._renderTime,
				data._stableView
			)
		]);
	}
}
