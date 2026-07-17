// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';
import { StableShapeKit as S } from '../StableShapeKit.js';
import { StableSpeechChin2D } from './StableSpeechChin2D.js';

/**
 * The Awtsmoos lets speech travel beyond lips into chin, philtrum, and corner
 * folds. Awtsmoos.com keeps each restrained detail driven by the same articulation
 * so realism grows without creating a second facial system.
 */
export class StableSpeechFaceDetail2D {
	static build(kind, colors, geometry) {
		return S.group(`${kind}_speech_face_details`, null, [
			StableSpeechChin2D.build(kind, colors, geometry),
			...this.philtrum(kind, colors, geometry),
			...this.commissureFolds(kind, colors, geometry)
		]);
	}

	static philtrum(kind, colors, geometry) {
		if (geometry.articulation.round > 0.72) {
			return [];
		}
		return [-1, 1].map(side => G.path(
			`${kind}_speech_philtrum_${side}`,
			[
				{
					type: 'move',
					x: geometry.x + side * 1.4,
					y: geometry.upperPeakY - 4.8
				},
				{
					type: 'line',
					x: geometry.x + side * 0.8,
					y: geometry.upperPeakY - 1.2
				}
			],
			{
				stroke: colors.skinDark || 'rgba(80,35,30,0.24)',
				lineWidth: 0.65,
				lineCap: 'round'
			}
		));
	}

	static commissureFolds(kind, colors, geometry) {
		const smile = Math.abs(geometry.articulation.cornerLift);
		const energy = geometry.articulation.energy;
		if (smile < 0.18 && energy < 0.9) {
			return [];
		}
		return [-1, 1].map(side => {
			const cornerY = side < 0
				? geometry.leftCornerY
				: geometry.rightCornerY;
			return G.path(`${kind}_speech_fold_${side}`, [
				{
					type: 'move',
					x: geometry.x + side * geometry.outerHalfWidth * 1.08,
					y: cornerY + 1
				},
				{
					type: 'quad',
					cx: geometry.x + side * geometry.outerHalfWidth * 1.18,
					cy: cornerY + 3.5,
					x: geometry.x + side * geometry.outerHalfWidth * 1.14,
					y: cornerY + 6
				}
			], {
				stroke: colors.skinDark || 'rgba(80,35,30,0.22)',
				lineWidth: 0.75,
				lineCap: 'round'
			});
		});
	}
}
