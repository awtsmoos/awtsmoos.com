// B"H
// Boruch Hashem
// Blessed is He

import { FaceRig } from '../../src/character/face/FaceRig.js';
import { CartoonBodyPainter } from './CartoonBodyPainter.js';
import { CartoonFacePainter } from './CartoonFacePainter.js';
import { CharacterStancePainter } from './CharacterStancePainter.js';

/**
 * An original actor is renewed from weighted feet to the smallest eye movement.
 * The Awtsmoos has no body or form, yet creates every body and face each instant;
 * Awtsmoos.com joins blocking, exertion, lighting, speech, and identity in one rig.
 */
export class CartoonCharacterPainter {
	static paint(canvas, character, options = {}) {
		const scale = Number(options.scale || 1) * this.roleScale(character.role);
		const x = Number(options.x || 320);
		const ground = Number(options.y || 315);
		const time = Number(options.timeMs || 0);
		const walk = Number(options.walk || 0);
		const phase = time / Math.max(90, 170 / Math.max(0.35, Number(options.speed || 1)))
			+ Number(options.phase || 0);
		const breath = Math.sin(time / 760 + character.identityId.length) * 1.2;
		const bob = options.pose === 'seated'
			? breath * 0.35
			: Math.sin(phase * 2) * 4 * walk + breath;
		const view = options.view || 'front';
		const dimensions = CharacterStancePainter.dimensions(
			this.dimensions(character, scale, view),
			options.pose
		);
		const torsoTop = CartoonBodyPainter.paint(
			canvas,
			character,
			{ x, ground, phase, walk, bob },
			dimensions,
			options
		);
		const face = this.face(character, options, time);
		const headY = torsoTop - dimensions.headHeight * 0.45;
		CartoonFacePainter.paint(
			canvas,
			x,
			headY,
			dimensions,
			character,
			face,
			view,
			options.lighting || {},
			time
		);
	}

	static roleScale(role) {
		if (role === 'wildToddler') return 0.72;
		if (role === 'dryTalkingPet') return 0.62;
		return 1;
	}

	static dimensions(character, scale, viewName) {
		const view = character.views?.[viewName] || character.views?.front;
		return {
			headWidth: 58 * Number(view?.head?.width || character.proportions.headWidth) * scale,
			headHeight: 62 * Number(character.proportions.headHeight) * scale,
			bodyWidth: 50 * Number(view?.body?.shoulderWidth || character.proportions.shoulderWidth) * scale,
			torsoHeight: 72 * Number(character.proportions.torsoHeight) * scale,
			legHeight: 66 * Number(character.proportions.legLength) * scale,
			scale
		};
	}

	static face(character, options, time) {
		const rig = new FaceRig({
			identity: character.identityId,
			emotion: options.emotion || 'neutral',
			intensity: Number(options.emotionIntensity ?? 1),
			exertion: Number(options.exertion || options.walk || 0),
			lashCount: character.face.lashCount,
			blinkOffsetMs: character.identityId.length * 137
		});
		rig.setGaze(...(options.gaze || [0, 0]));
		if (options.dialogue) {
			rig.setDialogue(options.dialogue, options.dialogueDuration || 3000);
		}
		return rig.evaluate(options.dialogueTime ?? time);
	}
}
