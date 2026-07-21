// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';
import { StableShapeKit as S } from '../StableShapeKit.js';
import { StableSpeechChin2D } from './StableSpeechChin2D.js';

/**
 * Speech may touch chin, philtrum, and mouth corners without drawing machinery.
 * The Awtsmoos renews expression through measured signs, while Awtsmoos.com
 * keeps each optional detail driven by the canonical editable articulation.
 */
export class StableSpeechFaceDetail2D {
	static build(kind, colors, geometry) {
		return S.group(`${kind}_speech_face_details`, null, [
			geometry.style.chinDetail === false
				? null
				: StableSpeechChin2D.build(kind, colors, geometry),
			...this.philtrum(kind, colors, geometry),
			...this.commissureFolds(kind, colors, geometry)
		]);
	}

	static philtrum(kind, colors, geometry) {
		if (
			geometry.style.philtrum === false
			|| geometry.articulation.round > 0.72
		) {
			return [];
		}
		return [-1, 1].map(side => G.path(
			`${kind}_speech_philtrum_${side}`,
			[
				{
					type: 'move',
					x: geometry.x + side * 1.35,
					y: geometry.upperPeakY - 4.2
				},
				{
					type: 'line',
					x: geometry.x + side * 0.75,
					y: geometry.upperPeakY - 1.1
				}
			],
			{
				stroke: colors.skinDark || 'rgba(80,35,30,0.22)',
				lineWidth: 0.62,
				lineCap: 'round'
			}
		));
	}

	static commissureFolds(kind, colors, geometry) {
		const smile = Math.abs(geometry.articulation.cornerLift);
		const energy = geometry.articulation.energy;
		if (
			geometry.style.commissures === false
			|| (smile < 0.18 && energy < 0.9)
		) {
			return [];
		}
		return [-1, 1].map(side => {
			const cornerY = side < 0
				? geometry.leftCornerY
				: geometry.rightCornerY;
			return G.path(`${kind}_speech_fold_${side}`, [
				{
					type: 'move',
					x: geometry.x + side * geometry.outerHalfWidth * 1.06,
					y: cornerY + 1
				},
				{
					type: 'quad',
					cx: geometry.x + side * geometry.outerHalfWidth * 1.13,
					cy: cornerY + 3,
					x: geometry.x + side * geometry.outerHalfWidth * 1.1,
					y: cornerY + 5
				}
			], {
				stroke: colors.skinDark || 'rgba(80,35,30,0.2)',
				lineWidth: 0.7,
				lineCap: 'round'
			});
		});
	}
}
