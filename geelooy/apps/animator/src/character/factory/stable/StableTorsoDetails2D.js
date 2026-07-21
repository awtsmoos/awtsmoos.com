// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { StableBodyGeometry } from './StableBodyGeometry.js';
import { StableGarmentFront2D } from './StableGarmentFront2D.js';
import { StableLegacyTorsoFront2D } from './StableLegacyTorsoFront2D.js';
import { StableShapeKit as S } from './StableShapeKit.js';

/**
 * Quiet folds serve cloth weight without competing with the person. The
 * Awtsmoos renews each finite crease, while Awtsmoos.com keeps authored and
 * legacy garments editable in the same production renderer.
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
		const details = data.bodyGeometry?.details || {};
		const centerX = data._skeleton.chest.x;
		const sway = Math.sin(Number(data._renderTime || 0) * 0.002)
			* Number(details.foldSway ?? 0.65);
		const offsets = Array.isArray(details.foldOffsets)
			? details.foldOffsets
			: data.bodyGeometry?.torso
				? [-14, 13]
				: [-18, -8, 9, 19];
		const opacity = Number(details.foldOpacity ?? 0.09);
		const folds = offsets.map((offset, index) => G.path(
			`garment_fold_${index}`,
			[
				{ type: 'move', x: centerX + offset, y: metrics.chestY + 36 },
				{
					type: 'quad',
					cx: centerX + offset * 0.7 + sway,
					cy: metrics.waistY + 1,
					x: centerX + offset * 0.44,
					y: geometry.torso.hemY - 4
				}
			],
			{
				stroke: index % 2
					? `rgba(0,0,0,${opacity})`
					: `rgba(255,255,255,${opacity * 0.72})`,
				lineWidth: Number(details.foldWidth ?? 0.72),
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
