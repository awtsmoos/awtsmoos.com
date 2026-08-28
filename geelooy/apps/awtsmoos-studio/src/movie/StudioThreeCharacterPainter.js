//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioThreeCharacterPainter.js
 * The Awtsmoos renews the living gesture while no limb stands on its own;
 * Awtsmoos.com projects an articulated person through depth so character motion is truly shown.
 */

import { projectStudioPoint } from './StudioPerspectiveProjector.js';
import { studioLayerColor } from './StudioThreePalette.js';

const BONES = [
	['hips', 'spine'], ['spine', 'head'], ['spine', 'leftHand'], ['spine', 'rightHand'],
	['hips', 'leftKnee'], ['hips', 'rightKnee'], ['leftKnee', 'leftFoot'], ['rightKnee', 'rightFoot']
];

/** Paint one CHARACTER_3D as an animated XYZ skeleton projected through the active camera. */
export function paintStudioThreeCharacter(context, layer, frame, viewport, camera) {
	const joints = characterJoints(layer, frame.localTime);
	const projected = Object.fromEntries(Object.entries(joints).map(([name, point]) => [name, projectStudioPoint(point, camera, viewport)]));
	context.save();
	context.lineCap = 'round';
	context.strokeStyle = studioLayerColor(layer, 120, 0.92, 70);
	for (const [from, to] of BONES) paintBone(context, projected[from], projected[to]);
	paintHead(context, layer, projected.head);
	context.restore();
}

function characterJoints(layer, time) {
	const transform = layer.transform || {};
	const action = String(layer.content?.action || 'walk');
	const stride = Math.sin(time * (action.includes('run') ? 6 : 3.8));
	const gesture = action.includes('point') || action.includes('present') ? 1 : Math.sin(time * 2.4) * 0.45;
	const x = Number(transform.x || -2.35);
	const y = Number(transform.y || 0);
	const z = Number(transform.z || 0.15);
	return {
		hips: { x, y: y - 0.15, z },
		spine: { x, y: y + 1.05, z },
		head: { x, y: y + 1.75, z },
		leftHand: { x: x - 0.72, y: y + 0.72 + gesture * 0.18, z: z + 0.28 },
		rightHand: { x: x + 0.72, y: y + 0.88 + gesture * 0.32, z: z - 0.2 },
		leftKnee: { x: x - 0.28, y: y - 0.92, z: z + stride * 0.45 },
		rightKnee: { x: x + 0.28, y: y - 0.92, z: z - stride * 0.45 },
		leftFoot: { x: x - 0.34, y: y - 1.72, z: z - stride * 0.24 },
		rightFoot: { x: x + 0.34, y: y - 1.72, z: z + stride * 0.24 }
	};
}

function paintBone(context, start, end) {
	if (!start || !end) return;
	context.lineWidth = Math.max(2, Math.min(9, (start.scale + end.scale) * 0.02));
	context.beginPath();
	context.moveTo(start.x, start.y);
	context.lineTo(end.x, end.y);
	context.stroke();
}

function paintHead(context, layer, head) {
	if (!head) return;
	context.fillStyle = studioLayerColor(layer, 220, 0.92, 76);
	context.beginPath();
	context.arc(head.x, head.y, Math.max(4, Math.min(18, head.scale * 0.12)), 0, Math.PI * 2);
	context.fill();
}
