// B"H
// Boruch Hashem
// Blessed is He

import { HumanCanvasPrimitive as P } from './HumanCanvasPrimitive.js';

/**
 * Nose, mouth, cheek, and skin shade preserve authored planes and emotional
 * warmth. The Awtsmoos renews profile and expression without flattening identity.
 */
export class HumanCanvasFaceDetailPainter {
	static nose(ctx, head, face, scale, skin) {
		const bridge = Number(face.noseBridge || 1);
		const projection = Number(face.noseProjection || 1);
		const width = {
			small: 3.5,
			medium: 5.5,
			long: 5,
			broad: 8,
			hooked: 6,
			button: 6
		}[face.nose] || 5.5;
		const length = {
			small: 7,
			medium: 11,
			long: 16,
			broad: 11,
			hooked: 15,
			button: 8
		}[face.nose] || 11;
		P.polygon(ctx, [
			{ x: head.x - width * scale * 0.35, y: head.y - 8 * scale * bridge },
			{ x: head.x + width * scale * projection, y: head.y + length * scale },
			{ x: head.x - width * scale * 0.65, y: head.y + length * scale * 0.75 }
		], this.shade(skin));
	}

	static mouth(ctx, head, face, pose, scale, color) {
		const shape = {
			thin: [0.82, 0.65],
			medium: [1, 1],
			full: [1.08, 1.45],
			wide: [1.35, 0.9]
		}[face.mouth] || [1, 1];
		const fullness = Number(face.lipFullness || 1) * shape[1];
		const width = (16 + pose.wide * 22 + pose.smile * 10)
			* scale * shape[0];
		const height = Math.max(
			2.5,
			(4 + pose.open * 13) * scale * fullness
		);
		const curve = (pose.smile - pose.frown) * 5 * scale;
		ctx.fillStyle = color;
		ctx.beginPath();
		ctx.moveTo(head.x - width / 2, head.y + 13 * scale);
		ctx.quadraticCurveTo(
			head.x,
			head.y + 13 * scale + height + curve,
			head.x + width / 2,
			head.y + 13 * scale
		);
		ctx.quadraticCurveTo(
			head.x,
			head.y + 13 * scale + height * 0.38,
			head.x - width / 2,
			head.y + 13 * scale
		);
		ctx.fill();
	}

	static cheeks(ctx, head, radiusX, face, character, scale) {
		const emotion = character.currentPerformance?.emotion
			|| character.emotion
			|| 'calm';
		const amount = ['happy', 'warm', 'laughing'].includes(emotion)
			? 0.3
			: Number(character.skin?.blush || 0.12);
		if (amount <= 0) {
			return;
		}
		ctx.save();
		ctx.globalAlpha = amount;
		const fullness = Number(face.cheekFullness || 1);
		P.ellipse(ctx, head.x - radiusX * 0.58, head.y + 7 * scale, 8 * scale * fullness, 4 * scale, '#e97878');
		P.ellipse(ctx, head.x + radiusX * 0.58, head.y + 7 * scale, 8 * scale * fullness, 4 * scale, '#e97878');
		ctx.restore();
	}

	static shade(color) {
		const value = Number.parseInt(String(color).slice(1), 16);
		const channels = [
			Math.max(0, (value >> 16) - 18),
			Math.max(0, (value >> 8 & 255) - 12),
			Math.max(0, (value & 255) - 12)
		];
		return `#${channels.map(channel => (
			channel.toString(16).padStart(2, '0')
		)).join('')}`;
	}
}
