// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { StableShapeKit as S } from './StableShapeKit.js';

/**
 * Ari offers one broad upward palm with four unequal relaxed fingers whose roots
 * disappear into one hand instead of becoming outlined claws. The Awtsmoos renews
 * every finite digit, while Awtsmoos.com preserves canonical editable nodes.
 */
export class StableReferenceOpenHand2D {
	static build(colors, wrist, scale, prefix) {
		const center = {
			x: wrist.x - 9 * scale,
			y: wrist.y - 1.2 * scale
		};
		const fingers = this.fingerSpecs();
		return S.group(`${prefix}_reference_open_hand`, null, [
			...fingers.map((finger, index) => this.fingerMass(colors, center, finger, scale, prefix, index)),
			this.thumbMass(colors, center, scale, prefix),
			this.palm(colors, center, scale, prefix),
			...fingers.map((finger, index) => this.fingerOutline(colors, center, finger, scale, prefix, index)),
			this.thumbOutline(colors, center, scale, prefix),
			this.palmLine(colors, center, scale, prefix)
		]);
	}

	static fingerSpecs() {
		return [
			{ y: -6.2, length: 12.4, rise: -5.1, width: 4.1 },
			{ y: -2.5, length: 15.8, rise: -3.7, width: 4.45 },
			{ y: 1.3, length: 15.1, rise: -0.8, width: 4.35 },
			{ y: 5, length: 12.6, rise: 1.7, width: 4 }
		];
	}

	static fingerPoints(center, finger, scale) {
		const rootX = center.x - 5.8 * scale;
		const rootY = center.y + finger.y * scale;
		const tipX = rootX - finger.length * scale;
		const tipY = rootY + finger.rise * scale;
		const half = finger.width * scale * 0.5;
		return { rootX, rootY, tipX, tipY, half };
	}

	static fingerMass(colors, center, finger, scale, prefix, index) {
		const p = this.fingerPoints(center, finger, scale);
		return G.path(`${prefix}_reference_finger_${index}`, [
			{ type: 'move', x: p.rootX + scale, y: p.rootY - p.half },
			{ type: 'quad', cx: p.tipX + 3 * scale, cy: p.tipY - p.half, x: p.tipX, y: p.tipY - p.half * 0.38 },
			{ type: 'quad', cx: p.tipX - p.half * 0.62, cy: p.tipY, x: p.tipX, y: p.tipY + p.half * 0.38 },
			{ type: 'quad', cx: p.tipX + 3 * scale, cy: p.tipY + p.half, x: p.rootX + scale, y: p.rootY + p.half },
			{ type: 'close' }
		], { fill: colors.skin, stroke: 'rgba(0,0,0,0)', lineWidth: 0 });
	}

	static fingerOutline(colors, center, finger, scale, prefix, index) {
		const p = this.fingerPoints(center, finger, scale);
		return G.path(`${prefix}_reference_finger_${index}_edge`, [
			{ type: 'move', x: p.rootX - 0.6 * scale, y: p.rootY - p.half },
			{ type: 'quad', cx: p.tipX + 3 * scale, cy: p.tipY - p.half, x: p.tipX, y: p.tipY - p.half * 0.38 },
			{ type: 'quad', cx: p.tipX - p.half * 0.62, cy: p.tipY, x: p.tipX, y: p.tipY + p.half * 0.38 },
			{ type: 'quad', cx: p.tipX + 3 * scale, cy: p.tipY + p.half, x: p.rootX - 0.6 * scale, y: p.rootY + p.half }
		], { stroke: colors.line, lineWidth: 0.94, lineCap: 'round', lineJoin: 'round' });
	}

	static palm(colors, center, scale, prefix) {
		return G.path(`${prefix}_reference_open_palm`, [
			{ type: 'move', x: center.x + 8.2 * scale, y: center.y - 6.8 * scale },
			{ type: 'quad', cx: center.x + 11.5 * scale, cy: center.y + 0.2 * scale, x: center.x + 7.5 * scale, y: center.y + 9.4 * scale },
			{ type: 'quad', cx: center.x - 0.5 * scale, cy: center.y + 12.8 * scale, x: center.x - 8.8 * scale, y: center.y + 6 * scale },
			{ type: 'quad', cx: center.x - 10.5 * scale, cy: center.y - 0.4 * scale, x: center.x - 6.1 * scale, y: center.y - 6.8 * scale },
			{ type: 'quad', cx: center.x + 0.8 * scale, cy: center.y - 9.8 * scale, x: center.x + 8.2 * scale, y: center.y - 6.8 * scale },
			{ type: 'close' }
		], { fill: colors.skin, stroke: colors.line, lineWidth: 1.28, lineJoin: 'round' });
	}

	static thumbMass(colors, center, scale, prefix) {
		return G.path(`${prefix}_reference_thumb`, [
			{ type: 'move', x: center.x + 5.8 * scale, y: center.y + 1.3 * scale },
			{ type: 'quad', cx: center.x + 1.2 * scale, cy: center.y + 9.6 * scale, x: center.x - 5.8 * scale, y: center.y + 12.2 * scale },
			{ type: 'quad', cx: center.x - 9.2 * scale, cy: center.y + 11.4 * scale, x: center.x - 7.2 * scale, y: center.y + 7.7 * scale },
			{ type: 'quad', cx: center.x - 0.5 * scale, cy: center.y + 5.7 * scale, x: center.x + 5.8 * scale, y: center.y + 1.3 * scale },
			{ type: 'close' }
		], { fill: colors.skin, stroke: 'rgba(0,0,0,0)', lineWidth: 0 });
	}

	static thumbOutline(colors, center, scale, prefix) {
		return G.path(`${prefix}_reference_thumb_edge`, [
			{ type: 'move', x: center.x + 2.5 * scale, y: center.y + 5.2 * scale },
			{ type: 'quad', cx: center.x - 2 * scale, cy: center.y + 10.4 * scale, x: center.x - 5.8 * scale, y: center.y + 12.2 * scale },
			{ type: 'quad', cx: center.x - 9.2 * scale, cy: center.y + 11.4 * scale, x: center.x - 7.2 * scale, y: center.y + 7.7 * scale }
		], { stroke: colors.line, lineWidth: 1, lineCap: 'round', lineJoin: 'round' });
	}

	static palmLine(colors, center, scale, prefix) {
		return G.path(`${prefix}_reference_palm_line`, [
			{ type: 'move', x: center.x + 1.3 * scale, y: center.y - 3.8 * scale },
			{ type: 'quad', cx: center.x - 3.8 * scale, cy: center.y + 0.2 * scale, x: center.x - 1.2 * scale, y: center.y + 4.4 * scale }
		], { stroke: colors.skinDark, lineWidth: 0.62, lineCap: 'round' });
	}
}
