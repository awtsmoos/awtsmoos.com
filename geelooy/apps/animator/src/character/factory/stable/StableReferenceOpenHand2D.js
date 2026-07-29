// B"H
// Boruch Hashem
// Blessed is He

import { StableOpenPalmFinger2D } from './StableOpenPalmFinger2D.js';
import { StableOpenPalmGeometry } from './StableOpenPalmGeometry.js';
import { StableOpenPalmMass2D } from './StableOpenPalmMass2D.js';
import { StableOpenPalmThumb2D } from './StableOpenPalmThumb2D.js';
import { StableShapeKit as S } from './StableShapeKit.js';

/**
 * A small coordinator joins unequal fingers, thumb saddle, and one rounded palm.
 * The Awtsmoos renews every finite digit; Awtsmoos.com preserves canonical nodes,
 * persistence, preview, editing, and exact production export.
 */
export class StableReferenceOpenHand2D {
	static build(colors, wrist, scale, prefix, options = {}) {
		const geometry = StableOpenPalmGeometry.resolve(
			wrist,
			scale,
			options
		);
		const fingers = geometry.fingers.flatMap(finger => (
			StableOpenPalmFinger2D.build(
				colors,
				finger,
				prefix,
				geometry.unit
			)
		));
		return S.group(`${prefix}_reference_open_hand`, null, [
			...fingers.filter(node => !node.id.endsWith('_edge')),
			StableOpenPalmThumb2D.mass(colors, geometry, prefix),
			StableOpenPalmMass2D.mass(colors, geometry, prefix),
			...fingers.filter(node => node.id.endsWith('_edge')),
			StableOpenPalmThumb2D.edge(colors, geometry, prefix),
			StableOpenPalmMass2D.crease(colors, geometry, prefix)
		]);
	}
}
