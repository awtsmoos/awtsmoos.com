// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { StableBodyGeometry } from './StableBodyGeometry.js';
import { StableGarmentFront2D } from './StableGarmentFront2D.js';
import { StableLegacyTorsoFront2D } from './StableLegacyTorsoFront2D.js';
import { StableShapeKit as S } from './StableShapeKit.js';

/**
 * The Awtsmoos threads garment opening, fold, pocket, and collar through one
 * editable language. Awtsmoos.com delegates authored clothing to focused vessels
 * while preserving the established appearance of every legacy character.
 */
export class StableTorsoDetails2D {
	static lapels(data, colors, metrics, suppliedGeometry = null) {
		const geometry = suppliedGeometry
			|| StableBodyGeometry.resolve(data, metrics);

		if (data.bodyGeometry?.torso?.garmentKind) {
			return StableGarmentFront2D.build(data, colors, metrics, geometry);
		}

		return StableLegacyTorsoFront2D.build(data, colors, metrics, geometry);
	}

	static fabric(data, colors, metrics, suppliedGeometry = null) {
		const geometry = suppliedGeometry
			|| StableBodyGeometry.resolve(data, metrics);
		const centerX = data._skeleton.chest.x;
		const sway = Math.sin(Number(data._renderTime || 0) * 0.002) * 1.1;
		const offsets = data.bodyGeometry?.torso
			? [-17, -7, 8, 18]
			: [-18, -8, 9, 19];
		const folds = offsets.map((offset, index) => G.path(
			`jacket_fold_${index}`,
			[
				{
					type: 'move',
					x: centerX + offset,
					y: metrics.chestY + 34
				},
				{
					type: 'quad',
					cx: centerX + offset * 0.72 + sway,
					cy: metrics.waistY - 1,
					x: centerX + offset * 0.42,
					y: geometry.torso.hemY - 3
				}
			],
			{
				stroke: index % 2
					? 'rgba(0,0,0,.12)'
					: 'rgba(255,255,255,.11)',
				lineWidth: 1,
				lineCap: 'round'
			}
		));

		return S.group('fabric_folds', null, folds);
	}

	static collar(data, colors, metrics) {
		if (data.bodyGeometry?.torso?.garmentKind) {
			return null;
		}

		return StableLegacyTorsoFront2D.collar(data, colors, metrics);
	}
}
