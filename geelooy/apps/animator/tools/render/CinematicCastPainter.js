// B"H
// Boruch Hashem
// Blessed is He

import { CartoonCharacterPainter } from './CartoonCharacterPainter.js';
import { CinematicBlockingResolver } from './CinematicBlockingResolver.js';
import { CinematicPerformanceResolver } from './CinematicPerformanceResolver.js';

/**
 * A cast becomes an ensemble through depth, crossing, focus, listening, and
 * consequence. The Awtsmoos renews every body while Awtsmoos.com paints actors
 * from far to near using shot-authored blocking rather than equal spacing.
 */
export class CinematicCastPainter {
	static paint(canvas, plan, shot, camera, dialogue, timeMs, lighting = {}) {
		const visible = plan.characters.filter((character) => {
			return shot.characters.includes(character.identityId);
		});
		const placements = visible.map((character, index) => ({
			character,
			index,
			blocking: CinematicBlockingResolver.resolve(
				shot,
				character.identityId,
				index,
				visible.length,
				camera,
				timeMs
			)
		})).filter((entry) => entry.blocking.visible);
		placements.sort((first, second) => first.blocking.depth - second.blocking.depth);
		for (const entry of placements) {
			this.actor(canvas, plan, shot, entry, dialogue, timeMs, camera, lighting);
		}
	}

	static actor(canvas, plan, shot, entry, dialogue, timeMs, camera, lighting) {
		const { character, blocking, index } = entry;
		const performance = CinematicPerformanceResolver.resolve(
			plan,
			character.identityId,
			timeMs
		);
		const speaking = dialogue?.speakerId === character.identityId;
		const localDialogue = speaking ? timeMs - dialogue.start : 0;
		const focusScale = 0.92 + blocking.focusWeight * 0.12 + camera.focus * 0.04;
		CartoonCharacterPainter.paint(canvas, character, {
			x: blocking.x + Number(camera.leadRoom || 0),
			y: blocking.y,
			scale: camera.scale * blocking.scale * focusScale,
			view: blocking.view,
			timeMs,
			phase: blocking.phase + index,
			walk: this.motion(performance.action),
			speed: Number(performance.speed || 1),
			exertion: Number(performance.exertion || 0),
			emotion: speaking ? dialogue.emotion : performance.emotion || 'concerned',
			emotionIntensity: Number(performance.emotionIntensity || 1),
			gaze: performance.gaze || this.gazeToFocus(blocking, camera),
			dialogue: speaking ? dialogue.text : '',
			dialogueDuration: speaking ? dialogue.duration : 1000,
			dialogueTime: localDialogue,
			pose: performance.pose,
			prop: performance.prop || shot.composition?.prop,
			gesture: performance.gesture,
			lean: performance.lean,
			lighting: {
				...lighting,
				keyStrength: Number(lighting.keyStrength || 0.2) * (0.8 + blocking.focusWeight * 0.25)
			}
		});
	}

	static motion(action) {
		if (['run', 'sprint', 'pursuit', 'scramble', 'wallRun'].includes(action)) return 1;
		if (['leap', 'dodge', 'climb', 'wade', 'circle', 'bridgeSprint'].includes(action)) return 0.72;
		if (['brace', 'release', 'stabilize'].includes(action)) return 0.18;
		return action ? 0.42 : 0.08;
	}

	static gazeToFocus(blocking, camera) {
		const direction = blocking.x < 320 ? 0.35 : -0.35;
		return [direction * (0.5 + camera.focus * 0.3), -0.05];
	}
}
