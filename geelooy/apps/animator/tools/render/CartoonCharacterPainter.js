// B"H
// Boruch Hashem
// Blessed is He

import { FaceRig } from '../../src/character/face/FaceRig.js';
import { CartoonBodyPainter } from './CartoonBodyPainter.js';
import { CartoonFacePainter } from './CartoonFacePainter.js';
import { CharacterStancePainter } from './CharacterStancePainter.js';

/**
 * An original actor is renewed from silhouette through expression. The Awtsmoos
 * has no body or form, yet creates body and form each instant; Awtsmoos.com keeps
 * identity, view, stance, prop, and speech joined without borrowing a character.
 */
export class CartoonCharacterPainter {
	static paint(canvas, character, options = {}) {
		const scale = (options.scale || 1) * this.roleScale(character.role);
		const x = options.x || 320;
		const ground = options.y || 315;
		const time = options.timeMs || 0;
		const walk = options.walk || 0;
		const phase = time / 170 + (options.phase || 0);
		const bob = options.pose === 'seated' ? 0 : Math.sin(phase * 2) * 4 * walk;
		const view = options.view || 'front';
		const baseDimensions = this.dimensions(character, scale, view);
		const dimensions = CharacterStancePainter.dimensions(baseDimensions, options.pose);
		const torsoTop = CartoonBodyPainter.paint(
			canvas,
			character,
			{ x, ground, phase, walk, bob },
			dimensions,
			options
		);
		const face = this.face(character, options, time);
		const headY = torsoTop - dimensions.headHeight * 0.45;
		CartoonFacePainter.paint(canvas, x, headY, dimensions, character, face, view);
	}

	static roleScale(role) {
		if (role === 'wildToddler') return 0.72;
		if (role === 'dryTalkingPet') return 0.62;
		return 1;
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
		if (options.dialogue) rig.setDialogue(options.dialogue, options.dialogueDuration || 3000);
		return rig.evaluate(options.dialogueTime ?? time);
	}
}
