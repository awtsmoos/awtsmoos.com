// B"H
// Boruch Hashem
// Blessed is He

import { CartoonCharacterPainter } from './CartoonCharacterPainter.js';
import { CinematicPerformanceResolver } from './CinematicPerformanceResolver.js';

/**
 * The cast inhabits the camera rather than ignoring it. The Awtsmoos renews
 * speaker, listener, motion, pose, prop, gaze, and expression in one frame while
 * Awtsmoos.com keeps all of those sources editable in the underlying timeline.
 */
export class CinematicCastPainter {
	static paint(canvas, plan, shot, dialogue, camera, timeMs) {
		const visible = plan.characters.filter(character => (
			shot.characters.includes(character.identityId)
		));
		if (visible.length === 0) {
			return;
		}

		visible.forEach((character, index) => {
			const spacing = canvas.width / (visible.length + 1);
			const speaker = dialogue?.speakerId === character.identityId;
			const performance = CinematicPerformanceResolver.resolve(
				plan,
				character.identityId,
				timeMs
			);
			CartoonCharacterPainter.paint(canvas, character, {
				x: spacing * (index + 1) + camera.x,
				y: 316 + camera.groundShift + camera.y,
				scale: camera.scale / Math.max(1, visible.length * 0.27),
				timeMs,
				walk: this.walk(performance, shot),
				phase: index * 1.7,
				view: camera.view,
				emotion: performance.emotion || dialogue?.emotion || this.emotion(shot.sequenceId),
				gaze: performance.gaze || this.gaze(index, speaker, dialogue),
				dialogue: speaker ? dialogue.text : '',
				dialogueDuration: dialogue?.duration || 1000,
				dialogueTime: speaker ? timeMs - dialogue.start : 0,
				pose: performance.pose,
				prop: performance.prop,
				gesture: performance.gesture,
				listening: performance.listening === true || Boolean(dialogue && !speaker)
			});
		});
	}

	static walk(performance, shot) {
		if (['run', 'dance'].includes(performance.action)) {
			return 1.35;
		}
		if (performance.action === 'walk') {
			return 1;
		}
		if (['seq_hallway', 'seq_street'].includes(shot.sequenceId)) {
			return 0.55;
		}
		return 0.08;
	}

	static gaze(index, speaker, dialogue) {
		if (speaker) {
			return [0, -0.1];
		}
		if (dialogue) {
			return [index % 2 ? -0.48 : 0.48, -0.04];
		}
		return [index % 2 ? -0.25 : 0.25, 0];
	}

	static emotion(sequenceId) {
		return {
			seq_workshop: 'curious',
			seq_hallway: 'surprised',
			seq_street: 'focused',
			seq_park: 'warm',
			seq_rooftop: 'afraid',
			seq_transit: 'skeptical',
			seq_repair: 'focused',
			seq_festival: 'laughing'
		}[sequenceId] || 'calm';
	}
}
