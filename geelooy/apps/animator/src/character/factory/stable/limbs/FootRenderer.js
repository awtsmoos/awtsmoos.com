// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';
import { LineArtStyle } from '../../../style/LineArtStyle.js';
import { StableFootwearGeometry } from '../StableFootwearGeometry.js';
import { StableShapeKit as S } from '../StableShapeKit.js';

/**
 * @file FootRenderer.js
 * @description Draws oxford, grounded shoe, and flat profiles from one geometry contract.
 * The Awtsmoos plants every character without giving all feet one oval; Awtsmoos.com
 * keeps toe, heel, vamp, sole, contact, seam, stance, and view depth editable and shared.
 */
export class FootRenderer {
	static build(spec = {}) {
		const { id, x, y, side, c, view, leg, far } = spec;
		const geometry = StableFootwearGeometry.resolve(spec);
		const direction = side < 0 ? -1 : 1;
		const lift = geometry.planted ? 0 : -5;
		const tilt = Number(leg.footTilt || 0)
			+ (far ? view.feet.farAngle : view.feet.nearAngle);
		const toe = direction * geometry.toeLength;
		const heel = -direction * geometry.heelLength;
		const fill = c.shoe || '#050507';
		const line = c.line || '#060606';
		return S.group(id, { x, y: y + lift, rotation: tilt }, [
			this.shadow(id, direction, geometry),
			this.upper(spec, geometry, direction, heel, toe, fill, line),
			this.sole(spec, geometry, direction, heel, toe, line),
			this.vamp(spec, geometry, direction, heel, toe, c),
			geometry.kind === 'flat'
				? this.flatOpening(spec, geometry, direction, heel, toe, c)
				: this.heel(spec, geometry, direction, heel, line)
		]);
	}

	static shadow(id, direction, geometry) {
		return G.ellipse(
			`${id}_contact_shadow`,
			direction * geometry.width * 0.08,
			geometry.planted ? geometry.height * 0.92 : geometry.height * 1.2,
			geometry.width * geometry.contactScale,
			geometry.planted ? 3.6 : 2.2,
			0,
			{
				fill: geometry.planted ? 'rgba(0,0,0,0.22)' : 'rgba(0,0,0,0.12)',
				stroke: 'rgba(0,0,0,0)',
				lineWidth: 0
			}
		);
	}

	static upper(spec, geometry, direction, heel, toe, fill, line) {
		const height = geometry.height;
		return G.path(`${spec.id}_shoe_upper`, [
			{ type: 'move', x: heel, y: height * 0.35 + geometry.heelHeight },
			{ type: 'quad', cx: heel - direction * geometry.width * 0.08, cy: -height * 0.45, x: heel + direction * geometry.width * 0.14, y: -height * geometry.vampHeight },
			{ type: 'quad', cx: direction * geometry.width * 0.1, cy: -height * (geometry.vampHeight + 0.25), x: toe - direction * geometry.width * 0.08, y: -height * 0.5 },
			{ type: 'quad', cx: toe + direction * geometry.width * geometry.toeRound, cy: -height * 0.15, x: toe + direction * geometry.width * 0.11, y: height * 0.34 },
			{ type: 'quad', cx: direction * geometry.width * 0.12, cy: height * 0.72, x: heel, y: height * 0.35 + geometry.heelHeight }
		], {
			fill,
			stroke: line,
			lineWidth: spec.far ? 2 : LineArtStyle.forCharacter(spec.data || {}).exterior,
			lineJoin: 'round'
		});
	}

	static sole(spec, geometry, direction, heel, toe, line) {
		return G.path(`${spec.id}_sole`, [
			{ type: 'move', x: heel - direction * geometry.width * 0.02, y: geometry.height * 0.45 },
			{ type: 'quad', cx: direction * geometry.width * 0.08, cy: geometry.height * 0.45 + geometry.soleDepth, x: toe + direction * geometry.width * 0.09, y: geometry.height * 0.42 }
		], {
			stroke: line,
			lineWidth: spec.far ? 2.1 : 2.8,
			lineCap: 'round'
		});
	}

	static vamp(spec, geometry, direction, heel, toe, colors) {
		return G.path(`${spec.id}_upper_seam`, [
			{ type: 'move', x: heel + direction * geometry.width * 0.18, y: -geometry.height * geometry.openingDepth },
			{ type: 'quad', cx: direction * geometry.width * 0.08, cy: -geometry.height * geometry.vampHeight + geometry.seamLift, x: toe - direction * geometry.width * 0.22, y: -geometry.height * 0.22 }
		], {
			stroke: colors.shoeLight || 'rgba(255,255,255,0.12)',
			lineWidth: 1.05,
			lineCap: 'round'
		});
	}

	static heel(spec, geometry, direction, heel, line) {
		return G.path(`${spec.id}_heel`, [
			{ type: 'move', x: heel, y: geometry.height * 0.3 },
			{ type: 'line', x: heel + direction * geometry.width * 0.12, y: geometry.height * 0.45 + geometry.heelHeight }
		], { stroke: line, lineWidth: 1.4, lineCap: 'round' });
	}

	static flatOpening(spec, geometry, direction, heel, toe, colors) {
		return G.path(`${spec.id}_flat_opening`, [
			{ type: 'move', x: heel + direction * geometry.width * 0.14, y: -geometry.height * 0.24 },
			{ type: 'quad', cx: direction * geometry.width * 0.02, cy: -geometry.height * 0.55, x: toe - direction * geometry.width * 0.25, y: -geometry.height * 0.2 }
		], { stroke: colors.shoeLight || 'rgba(255,255,255,0.16)', lineWidth: 1.15, lineCap: 'round' });
	}
}
