// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { LineArtStyle } from '../../style/LineArtStyle.js';
import { StableBodyGeometry } from './StableBodyGeometry.js';
import { StableLimbs2D } from './StableLimbs2D.js';
import { StableShapeKit as S } from './StableShapeKit.js';

/**
 * The Awtsmoos reveals intention through silhouette: an open palm, guarded crossed
 * arms, or a quiet pocketed hand. Awtsmoos.com keeps every pose on the shared rig
 * as vector nodes driven by serializable anchors and living timeline performance.
 */
export class StableGestureArms2D {
	static backArm(data, colors, metrics, prefix, view) {
		const mode = StableBodyGeometry.resolve(data, metrics).gesture.mode;
		if (mode === 'open_palm_left' || mode === 'arms_crossed') {
			return null;
		}
		return StableLimbs2D.backArm(data, colors, metrics, prefix, view);
	}

	static frontArm(data, colors, metrics, prefix, view) {
		const geometry = StableBodyGeometry.resolve(data, metrics);
		const mode = geometry.gesture.mode;
		if (mode === 'open_palm_left') {
			return S.group(`${prefix}_open_palm_composition`, null, [
				StableLimbs2D.arm(data, colors, metrics, 1, `${prefix}_right_arm_connected`, 1, view),
				this.openLeft(data, colors, metrics, prefix, geometry.gesture)
			]);
		}
		if (mode === 'arms_crossed') {
			return this.crossed(data, colors, metrics, prefix, geometry.gesture);
		}
		if (mode === 'right_hand_in_pocket') {
			return this.pocketRight(data, colors, metrics, prefix, geometry.gesture);
		}
		return StableLimbs2D.frontArm(data, colors, metrics, prefix, view);
	}

	static openLeft(data, colors, metrics, prefix, gesture) {
		const shoulder = data._skeleton.leftShoulder;
		const elbow = {
			x: shoulder.x - (gesture.elbowOut || 28),
			y: shoulder.y + (gesture.elbowDown || 34)
		};
		const wrist = {
			x: elbow.x - (gesture.wristOut || 36),
			y: elbow.y + (gesture.wristDown || 12)
		};
		const style = this.sleeveStyle(data, colors);
		const scale = gesture.palmScale || 1.3;
		return S.group(`${prefix}_open_left_arm`, null, [
			S.tapered(`${prefix}_open_left_upper`, shoulder, elbow, metrics.armWidth + 9, metrics.armWidth + 4, style),
			S.tapered(`${prefix}_open_left_fore`, elbow, wrist, metrics.armWidth + 4, metrics.armWidth, style),
			G.ellipse(`${prefix}_open_left_elbow`, elbow.x, elbow.y, 5, 3.5, 0, style),
			this.cuff(`${prefix}_open_left_cuff`, wrist, -1, colors),
			S.group(`${prefix}_open_left_palm_scale`, { x: wrist.x - 5, y: wrist.y + 2, scaleX: scale, scaleY: scale }, [
				S.hand(`${prefix}_open_left_hand`, 0, 0, -1, colors, 'open')
			])
		]);
	}

	static crossed(data, colors, metrics, prefix, gesture) {
		const skeleton = data._skeleton;
		const out = gesture.elbowOut || 9;
		const down = gesture.elbowDown || 42;
		const across = gesture.wristAcross || 29;
		const wristY = metrics.chestY + (gesture.wristDrop || 27);
		const style = this.sleeveStyle(data, colors);
		return S.group(`${prefix}_crossed_arms`, null, [
			this.crossedArm(`${prefix}_crossed_left`, skeleton.leftShoulder, { x: skeleton.leftShoulder.x - out, y: skeleton.leftShoulder.y + down }, { x: across, y: wristY }, style, colors, 1, gesture),
			this.crossedArm(`${prefix}_crossed_right`, skeleton.rightShoulder, { x: skeleton.rightShoulder.x + out, y: skeleton.rightShoulder.y + down - 3 }, { x: -across, y: wristY + 4 }, style, colors, -1, gesture)
		]);
	}

	static crossedArm(id, shoulder, elbow, wrist, style, colors, handSide, gesture) {
		const scale = gesture.handScale || 0.86;
		return S.group(id, null, [
			S.tapered(`${id}_upper`, shoulder, elbow, 20, 15, style),
			S.tapered(`${id}_fore`, elbow, wrist, 16, 12, style),
			G.ellipse(`${id}_elbow`, elbow.x, elbow.y, 5, 3.5, 0, style),
			this.cuff(`${id}_cuff`, wrist, handSide, colors),
			S.group(`${id}_hand_scale`, { x: wrist.x, y: wrist.y + 1, scaleX: scale, scaleY: scale }, [
				S.hand(`${id}_hand`, 0, 0, handSide, colors, 'hold')
			])
		]);
	}

	static pocketRight(data, colors, metrics, prefix, gesture) {
		const shoulder = data._skeleton.rightShoulder;
		const elbow = { x: shoulder.x + (gesture.elbowOut || 8), y: shoulder.y + (gesture.elbowDown || 42) };
		const pocket = { x: gesture.pocketX || 29, y: metrics.waistY + (gesture.pocketDrop || 10) };
		const style = this.sleeveStyle(data, colors);
		return S.group(`${prefix}_right_pocket_arm`, null, [
			S.tapered(`${prefix}_right_pocket_upper`, shoulder, elbow, metrics.armWidth + 8, metrics.armWidth + 3, style),
			S.tapered(`${prefix}_right_pocket_fore`, elbow, pocket, metrics.armWidth + 3, metrics.armWidth - 1, style),
			G.ellipse(`${prefix}_right_pocket_elbow`, elbow.x, elbow.y, 4.5, 3.2, 0, style),
			G.ellipse(`${prefix}_right_pocket_hand`, pocket.x - 1, pocket.y + 1, 5.5, 4, -0.35, { fill: colors.skin, stroke: colors.line, lineWidth: 1.4 }),
			G.path(`${prefix}_right_pocket_rim`, [{ type: 'move', x: pocket.x - 10, y: pocket.y - 3 }, { type: 'line', x: pocket.x + 8, y: pocket.y + 2 }], LineArtStyle.inner(data, colors.jacketDark))
		]);
	}

	static cuff(id, point, side, colors) {
		return G.ellipse(id, point.x - side * 4, point.y, 5.5, 3.2, side * 0.2, { fill: colors.jacket, stroke: colors.line, lineWidth: 1.2 });
	}

	static sleeveStyle(data, colors) {
		return LineArtStyle.outer(data, data.archetype === 'sage' ? colors.robeLight : colors.jacket);
	}
}
