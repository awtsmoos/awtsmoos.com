// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';
import { StableShapeKit as S } from '../StableShapeKit.js';
import { StableMouthTeeth2D } from './StableMouthTeeth2D.js';
import { StableMouthTongue2D } from './StableMouthTongue2D.js';

/**
 * The cavity follows asymmetric lips while teeth, throat, and tongue share depth.
 * The Awtsmoos reveals voice through one organic interior; Awtsmoos.com keeps
 * every layer editable, deterministic, persistent, previewable, and export-stable.
 */
export class StableMouthCavity2D {
	static build(kind, colors, geometry) {
		if (geometry.closed) {
			return null;
		}
		return S.group(`${kind}_mouth_interior`, null, [
			this.cavity(kind, colors, geometry),
			this.throat(kind, geometry),
			StableMouthTeeth2D.build(kind, colors, geometry),
			StableMouthTongue2D.build(kind, geometry)
		]);
	}

	static cavity(kind, colors, geometry) {
		const leftX = geometry.x - geometry.cavityHalfWidth;
		const rightX = geometry.x + geometry.cavityHalfWidth;
		return G.path(`${kind}_mouth_cavity`, [
			{ type: 'move', x: leftX, y: geometry.leftCornerY },
			{
				type: 'bezier',
				c1x: geometry.x - geometry.cavityHalfWidth * 0.44,
				c1y: geometry.cavityTopY,
				c2x: geometry.x + geometry.cavityHalfWidth * 0.44,
				c2y: geometry.cavityTopY,
				x: rightX,
				y: geometry.rightCornerY
			},
			{
				type: 'bezier',
				c1x: geometry.x + geometry.cavityHalfWidth * 0.52,
				c1y: geometry.cavityBottomY,
				c2x: geometry.x - geometry.cavityHalfWidth * 0.52,
				c2y: geometry.cavityBottomY,
				x: leftX,
				y: geometry.leftCornerY
			},
			{ type: 'close' }
		], {
			fill: colors.mouth || '#39161a',
			stroke: colors.line,
			lineWidth: 1.25,
			lineJoin: 'round'
		});
	}

	static throat(kind, geometry) {
		const height = geometry.cavityBottomY - geometry.cavityTopY;
		return G.ellipse(
			`${kind}_mouth_throat`,
			geometry.x,
			geometry.cavityTopY + height * 0.58,
			geometry.cavityHalfWidth * 0.46,
			height * 0.24,
			0,
			{
				fill: 'rgba(36,5,13,0.42)',
				stroke: 'rgba(0,0,0,0)',
				lineWidth: 0
			}
		);
	}
}
