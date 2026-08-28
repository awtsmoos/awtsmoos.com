// B"H
// Boruch Hashem
// Blessed is He

import { CartoonCharacterPainter } from './CartoonCharacterPainter.js';
import { CinematicBlockingResolver } from './CinematicBlockingResolver.js';
import { CinematicPerformanceResolver } from './CinematicPerformanceResolver.js';

/**
 * A cast becomes an ensemble through depth, focus, listening, and consequence.
 * The Awtsmoos renews every body while Awtsmoos.com carries authored performance
 * channels intact from the scene graph into the pixel renderer instead of dropping them.
 */
export class CinematicCastPainter {
	static referenceWidth = 640;
	static referenceHeight = 360;

	/** Paints visible actors back-to-front so authored depth remains legible. */
	static paint(canvas, plan, shot, camera, dialogue, timeMs, lighting = {}) {
		const visible = plan.characters.filter(character => shot.characters.includes(character.identityId));
		const placements = visible.map((character, index) => ({
			character,
			index,
			blocking: CinematicBlockingResolver.resolve(
				shot, character.identityId, index, visible.length, camera, timeMs
			)
		})).filter(entry => entry.blocking.visible);
		placements.sort((first, second) => first.blocking.depth - second.blocking.depth);
		for (const entry of placements) {
			this.actor(canvas, plan, shot, entry, dialogue, timeMs, camera, lighting);
		}
	}

	/** Maps layered acting data into one render-time actor recipe without mutating the plan. */
	static actor(canvas, plan, shot, entry, dialogue, timeMs, camera, lighting) {
		const { character, blocking, index } = entry;
		const performance = CinematicPerformanceResolver.resolve(plan, character.identityId, timeMs);
		const speaking = dialogue?.speakerId === character.identityId;
		const localDialogue = speaking ? timeMs - dialogue.start : 0;
		const focusScale = 0.92 + blocking.focusWeight * 0.12 + camera.focus * 0.04;
		const viewport = this.viewport(canvas);
		const worldSpeed = this.travelSpeed(shot, character.identityId);
		const walk = Math.max(this.motion(performance.action), Math.min(1, worldSpeed / 72));
		CartoonCharacterPainter.paint(canvas, character, {
			x: (blocking.x + Number(camera.leadRoom || 0)) * viewport.x,
			y: blocking.y * viewport.y,
			scale: camera.scale * blocking.scale * focusScale * viewport.scale,
			view: blocking.view,
			timeMs,
			phase: blocking.phase + index,
			walk,
			worldSpeed,
			speed: Number(performance.walkSpeed || performance.speed || 1),
			armSwing: Number(performance.armSwing ?? 1),
			breath: Number(performance.breath || 0),
			exertion: Number(performance.exertion || 0),
			emotion: speaking ? dialogue.emotion : performance.emotion || 'concerned',
			emotionIntensity: Number(performance.emotionIntensity || performance.intensity || 1),
			gaze: performance.gaze || this.gazeToFocus(blocking, camera),
			dialogue: speaking ? dialogue.text : '',
			dialogueDuration: speaking ? dialogue.duration : 1000,
			dialogueTime: localDialogue,
			pose: performance.pose,
			posture: performance.posture,
			prop: performance.prop || shot.composition?.prop,
			gesture: performance.gesture,
			interaction: performance.interaction,
			listening: performance.listening,
			lean: performance.lean,
			lighting: {
				...lighting,
				keyStrength: Number(lighting.keyStrength || 0.2) * (0.8 + blocking.focusWeight * 0.25)
			}
		});
	}

	static viewport(canvas) {
		const x = canvas.width / this.referenceWidth;
		const y = canvas.height / this.referenceHeight;
		return { x, y, scale: Math.min(x, y) };
	}

	static travelSpeed(shot, characterId) {
		const authored = shot.blocking?.[characterId];
		const start = authored?.start || authored;
		const end = authored?.end || authored;
		if (!start || !end) return 0;
		const distance = Math.hypot(Number(end.x || 0) - Number(start.x || 0), Number(end.y || 0) - Number(start.y || 0));
		const duration = Math.max(250, Number(shot.duration || Number(shot.end || 0) - Number(shot.start || 0) || 5000));
		return distance * 1000 / duration;
	}

	static motion(action) {
		if (['run', 'sprint', 'pursuit', 'scramble', 'wallRun', 'bridgeSprint'].includes(action)) return 1;
		if (['leap', 'dodge', 'climb', 'wade', 'circle'].includes(action)) return 0.72;
		if (['walk', 'advance', 'cross'].includes(action)) return 0.5;
		if (['brace', 'release', 'stabilize'].includes(action)) return 0.16;
		return action ? 0.34 : 0.04;
	}

	static gazeToFocus(blocking, camera) {
		const direction = blocking.x < this.referenceWidth / 2 ? 0.35 : -0.35;
		return [direction * (0.5 + camera.focus * 0.3), -0.05];
	}
}
