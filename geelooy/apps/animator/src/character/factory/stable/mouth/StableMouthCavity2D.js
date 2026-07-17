// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';
import { StableShapeKit as S } from '../StableShapeKit.js';
import { StableMouthTeeth2D } from './StableMouthTeeth2D.js';
import { StableMouthTongue2D } from './StableMouthTongue2D.js';

/**
 * The Awtsmoos reveals one speaking interior through cavity, throat, teeth, gum,
 * and tongue. Awtsmoos.com keeps every layer bound to shared articulation rather
 * than swapping disconnected mouth sprites.
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
		const { x, y, cavityHalfWidth, cavityHalfHeight } = geometry;
		return G.path(`${kind}_mouth_cavity`, [
			{ type: 'move', x: x - cavityHalfWidth, y },
			{
				type: 'quad',
				cx: x,
				cy: y - cavityHalfHeight * 1.18,
				x: x + cavityHalfWidth,
				y
			},
			{
				type: 'quad',
				cx: x,
				cy: y + cavityHalfHeight * 1.22,
				x: x - cavityHalfWidth,
				y
			}
		], {
			fill: colors.mouth || '#39161a',
			stroke: colors.line,
			lineWidth: 1.25,
			lineJoin: 'round'
		});
	}

	static throat(kind, geometry) {
		const height = geometry.cavityHalfHeight;
		return G.ellipse(
			`${kind}_mouth_throat`,
			geometry.x,
			geometry.y + height * 0.28,
			geometry.cavityHalfWidth * 0.46,
			height * 0.5,
			0,
			{
				fill: 'rgba(36,5,13,0.42)',
				stroke: 'rgba(0,0,0,0)',
				lineWidth: 0
			}
		);
	}
}
