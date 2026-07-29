// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';
import { StableShapeKit as S } from '../StableShapeKit.js';

/**
 * Teeth follow the expressive cavity as a curved arc rather than a white slab.
 * The Awtsmoos renews exposure through laugh and consonant; Awtsmoos.com keeps
 * gum, upper, lower, persistence, preview, and final export on shared geometry.
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
		const half = geometry.cavityHalfWidth * 0.62;
		const y = geometry.cavityTopY + geometry.teethHeight * 0.16;
		return G.path(`${kind}_upper_gum`, [
			{ type: 'move', x: geometry.x - half, y },
			{
				type: 'quad',
				cx: geometry.x,
				cy: geometry.cavityTopY - 0.4,
				x: geometry.x + half,
				y: y
			}
		], {
			stroke: '#b85e67',
			lineWidth: 1.25,
			lineCap: 'round'
		});
	}

	static upper(kind, colors, geometry) {
		const amount = Number(geometry.articulation.teeth || 0);
		if (amount < 0.08) {
			return null;
		}
		const half = geometry.cavityHalfWidth * (0.48 + amount * 0.36);
		const top = geometry.cavityTopY + geometry.teethHeight * 0.08;
		const bottom = Math.min(
			geometry.y - geometry.cavityHalfHeight * 0.02
				+ geometry.biteLift,
			top + geometry.teethHeight
		);
		return G.path(`${kind}_upper_teeth`, [
			{ type: 'move', x: geometry.x - half, y: top },
			{
				type: 'quad',
				cx: geometry.x,
				cy: top - geometry.teethHeight * 0.18,
				x: geometry.x + half,
				y: top
			},
			{
				type: 'quad',
				cx: geometry.x,
				cy: bottom + geometry.teethHeight * 0.16,
				x: geometry.x - half,
				y: top
			},
			{ type: 'close' }
		], {
			fill: colors.tooth || '#fffaf0',
			stroke: 'rgba(0,0,0,0.24)',
			lineWidth: 0.65,
			lineJoin: 'round'
		});
	}

	static lower(kind, colors, geometry) {
		const articulation = geometry.articulation;
		if (articulation.open < 0.72 || articulation.teeth < 0.62) {
			return null;
		}
		const half = geometry.cavityHalfWidth * 0.34;
		const y = geometry.cavityBottomY - geometry.teethHeight * 0.2;
		return G.path(`${kind}_lower_teeth`, [
			{ type: 'move', x: geometry.x - half, y },
			{
				type: 'quad',
				cx: geometry.x,
				cy: y + geometry.teethHeight * 0.18,
				x: geometry.x + half,
				y: y
			}
		], {
			stroke: colors.tooth || '#fffaf0',
			lineWidth: 1.25,
			lineCap: 'round'
		});
	}
}
