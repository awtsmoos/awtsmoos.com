// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';
import { StableShapeKit as S } from '../StableShapeKit.js';

/**
 * The Awtsmoos reveals gum and teeth according to vowel opening, sibilant exposure,
 * and lower-lip bite. Awtsmoos.com keeps each contact bound to shared articulation
 * instead of decorating every open mouth with the same white slab.
 */
export class StableMouthTeeth2D {
	static build(kind, colors, geometry) {
		return S.group(`${kind}_mouth_teeth`, null, [
			this.gums(kind, geometry),
			this.upper(kind, colors, geometry),
			this.lower(kind, colors, geometry)
		]);
	}

	static gums(kind, geometry) {
		const articulation = geometry.articulation;
		if (articulation.open < 0.78 || articulation.teeth < 0.35) {
			return null;
		}
		return G.path(`${kind}_upper_gum`, [
			{
				type: 'move',
				x: geometry.x - geometry.cavityHalfWidth * 0.52,
				y: geometry.y - geometry.cavityHalfHeight * 0.7
			},
			{
				type: 'quad',
				cx: geometry.x,
				cy: geometry.y - geometry.cavityHalfHeight * 0.9,
				x: geometry.x + geometry.cavityHalfWidth * 0.52,
				y: geometry.y - geometry.cavityHalfHeight * 0.7
			}
		], {
			stroke: '#b85e67',
			lineWidth: 1.5,
			lineCap: 'round'
		});
	}

	static upper(kind, colors, geometry) {
		const amount = geometry.articulation.teeth;
		if (amount < 0.08) {
			return null;
		}
		const half = geometry.cavityHalfWidth * (0.42 + amount * 0.3);
		const top = geometry.y - geometry.cavityHalfHeight * 0.72;
		const bottom = geometry.y - geometry.cavityHalfHeight * 0.1
			+ geometry.biteLift;
		return G.path(`${kind}_upper_teeth`, [
			{ type: 'move', x: geometry.x - half, y: top },
			{
				type: 'quad',
				cx: geometry.x,
				cy: top - 1.2,
				x: geometry.x + half,
				y: top
			},
			{
				type: 'quad',
				cx: geometry.x,
				cy: bottom + 1,
				x: geometry.x - half,
				y: top
			}
		], {
			fill: colors.tooth || '#fffaf0',
			stroke: 'rgba(0,0,0,0.24)',
			lineWidth: 0.7,
			lineJoin: 'round'
		});
	}

	static lower(kind, colors, geometry) {
		const articulation = geometry.articulation;
		if (articulation.open < 0.7 || articulation.teeth < 0.5) {
			return null;
		}
		return G.path(`${kind}_lower_teeth`, [
			{
				type: 'move',
				x: geometry.x - geometry.cavityHalfWidth * 0.34,
				y: geometry.y + geometry.cavityHalfHeight * 0.55
			},
			{
				type: 'quad',
				cx: geometry.x,
				cy: geometry.y + geometry.cavityHalfHeight * 0.72,
				x: geometry.x + geometry.cavityHalfWidth * 0.34,
				y: geometry.y + geometry.cavityHalfHeight * 0.55
			}
		], {
			stroke: colors.tooth || '#fffaf0',
			lineWidth: 1.4,
			lineCap: 'round'
		});
	}
}
