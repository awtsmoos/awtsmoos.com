// B"H
// Boruch Hashem
// Blessed is He

import { CinematicBlockingResolver } from '../CinematicBlockingResolver.js';

/**
 * A line of dialogue receives a safe bubble near its actual speaker. The
 * Awtsmoos renews word and face; Awtsmoos.com uses the same camera blocking to
 * preserve tails, margins, readable wrapping, and unobscured character acting.
 */
export class SpeechBubbleLayoutResolver {
	static resolve(canvas, plan, shot, camera, dialogue, timeMs) {
		const characters = plan.characters.filter(character => {
			return shot.characters.includes(character.identityId);
		});
		const index = characters.findIndex(character => character.identityId === dialogue.speakerId);
		const safeIndex = Math.max(0, index);
		const blocking = CinematicBlockingResolver.resolve(
			shot, dialogue.speakerId, safeIndex, characters.length, camera, timeMs
		);
		const viewportX = canvas.width / 640;
		const viewportY = canvas.height / 360;
		const speakerX = blocking.x * viewportX;
		const speakerY = (blocking.y - 150 * blocking.scale * camera.scale) * viewportY;
		const margin = Math.max(10, canvas.width * 0.025);
		const width = Math.min(canvas.width - margin * 2, Math.max(canvas.width * 0.36, 210 * viewportX));
		const height = Math.min(canvas.height * 0.3, Math.max(56, 78 * viewportY));
		const preferLeft = speakerX > canvas.width * 0.54;
		const proposedX = preferLeft ? speakerX - width - 24 * viewportX : speakerX + 24 * viewportX;
		const x = this.clamp(proposedX, margin, canvas.width - width - margin);
		const y = this.clamp(speakerY - height * 0.5, margin, canvas.height - height - margin);
		return {
			x, y, width, height, speakerX, speakerY,
			tailX: this.clamp(speakerX, x + 18, x + width - 18),
			tailY: speakerY < y ? y : y + height,
			textScale: canvas.width >= 1000 ? 3 : canvas.width < 260 ? 1 : 2
		};
	}

	static clamp(value, minimum, maximum) {
		return Math.max(minimum, Math.min(maximum, value));
	}
}
