// B"H
// Boruch Hashem
// Blessed is He

import { FaceRig } from '../../src/character/face/FaceRig.js';
import { CartoonFacePainter } from './CartoonFacePainter.js';

/**
 * These figures are original procedural actors, not replicas. The Awtsmoos
 * renews their outlined bodies, walking limbs, and speaking faces each frame.
 */
export class CartoonCharacterPainter {
	static paint(canvas, character, options = {}) {
		const roleScale = character.role === 'wildToddler'
			? 0.72
			: character.role === 'dryTalkingPet'
				? 0.62
				: 1;
		const scale = (options.scale || 1) * roleScale;
		const x = options.x || 320;
		const ground = options.y || 315;
		const time = options.timeMs || 0;
		const walk = options.walk || 0;
		const phase = time / 170 + (options.phase || 0);
		const bob = Math.sin(phase * 2) * 4 * walk;
		const face = this.face(character, options, time);
		const dimensions = this.dimensions(character, scale, options.view || 'front');
		this.shadow(canvas, x, ground, dimensions.bodyWidth);
		this.legs(canvas, x, ground + bob, dimensions, phase, walk, character.palette.secondary);
		const torsoTop = ground - dimensions.legHeight - dimensions.torsoHeight + bob;
		this.torso(canvas, x, torsoTop, dimensions, character);
		this.arms(
			canvas,
			x,
			ground - dimensions.legHeight - dimensions.torsoHeight * 0.7 + bob,
			dimensions,
			phase,
			walk,
			character
		);
		const headY = ground - dimensions.legHeight - dimensions.torsoHeight
			- dimensions.headHeight * 0.45 + bob;
		CartoonFacePainter.paint(canvas, x, headY, dimensions, character, face, options.view || 'front');
	}

	static dimensions(character, scale, viewName) {
		const view = character.views?.[viewName] || character.views?.front;
		return {
			headWidth: 58 * (view?.head?.width || character.proportions.headWidth) * scale,
			headHeight: 62 * character.proportions.headHeight * scale,
			bodyWidth: 50 * (view?.body?.shoulderWidth || character.proportions.shoulderWidth) * scale,
			torsoHeight: 72 * character.proportions.torsoHeight * scale,
			legHeight: 66 * character.proportions.legLength * scale,
			scale
		};
	}

	static face(character, options, time) {
		const rig = new FaceRig({
			emotion: options.emotion || 'neutral',
			lashCount: character.face.lashCount,
			blinkOffsetMs: character.identityId.length * 137
		});
		rig.setGaze(...(options.gaze || [0, 0]));
		if (options.dialogue) {
			rig.setDialogue(options.dialogue, options.dialogueDuration || 3000);
		}
		return rig.evaluate(options.dialogueTime ?? time);
	}

	static shadow(canvas, x, y, width) {
		canvas.ellipse(x, y + 4, width * 0.62, 7, '#263238');
	}

	static legs(canvas, x, ground, dimensions, phase, walk, color) {
		const swing = Math.sin(phase) * 12 * walk;
		const hipY = ground - dimensions.legHeight;
		for (const side of [-1, 1]) {
			const hipX = x + side * dimensions.bodyWidth * 0.18;
			const footX = x + side * dimensions.bodyWidth * 0.2 - side * swing;
			canvas.line(hipX, hipY, footX, ground, 11 * dimensions.scale, '#111827');
			canvas.line(hipX, hipY, footX, ground - 2, 7 * dimensions.scale, color);
		}
	}

	static torso(canvas, x, top, dimensions, character) {
		const centerY = top + dimensions.torsoHeight * 0.52;
		canvas.ellipse(x, centerY, dimensions.bodyWidth * 0.54, dimensions.torsoHeight * 0.56, '#111827');
		canvas.ellipse(x, centerY, dimensions.bodyWidth * 0.47, dimensions.torsoHeight * 0.49, character.palette.primary);
		canvas.rect(
			x - dimensions.bodyWidth * 0.35,
			top + dimensions.torsoHeight * 0.72,
			dimensions.bodyWidth * 0.7,
			8 * dimensions.scale,
			character.palette.accent
		);
	}

	static arms(canvas, x, shoulderY, dimensions, phase, walk, character) {
		const swing = Math.sin(phase) * 18 * walk;
		const gesture = character.role === 'wildToddler' ? Math.sin(phase * 0.5) * 14 : 0;
		for (const side of [-1, 1]) {
			const shoulderX = x + side * dimensions.bodyWidth * 0.42;
			const handX = x + side * dimensions.bodyWidth * 0.72 - side * swing;
			const handY = shoulderY + dimensions.torsoHeight * 0.62 + side * gesture;
			canvas.line(shoulderX, shoulderY, handX, handY, 12 * dimensions.scale, '#111827');
			canvas.line(shoulderX, shoulderY, handX, handY, 7 * dimensions.scale, character.palette.primary);
			canvas.circle(handX, handY, 7 * dimensions.scale, character.palette.skin);
		}
	}
}
