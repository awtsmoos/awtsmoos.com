// B"H
// Boruch Hashem
// Blessed is He

import { CinematicCameraResolver } from './CinematicCameraResolver.js';
import { CinematicCastPainter } from './CinematicCastPainter.js';
import { CinematicOverlayPainter } from './CinematicOverlayPainter.js';
import { CinematicSetPainter } from './CinematicSetPainter.js';
import { PixelCanvas } from './PixelCanvas.js';

/**
 * Camera, world, actors, performance clips, props, and words meet in one real
 * frame. The Awtsmoos, beyond depiction, renews every pixel while Awtsmoos.com
 * renders actual project state rather than a disconnected demonstration.
 */
export class CinematicFrameRenderer {
	constructor(plan) {
		this.plan = plan;
		this.width = plan.settings.width;
		this.height = plan.settings.height;
	}

	render(timeMs) {
		const canvas = new PixelCanvas(this.width, this.height);
		const shot = this.activeRequired(this.plan.shots, timeMs);
		const sequence = this.plan.sequences.find(item => item.id === shot.sequenceId);
		const dialogue = this.activeOptional(this.plan.dialogue, timeMs);
		const camera = CinematicCameraResolver.resolve(shot, timeMs);

		CinematicSetPainter.background(canvas, sequence, timeMs);
		CinematicSetPainter.setDressing(canvas, sequence, timeMs);
		CinematicCastPainter.paint(
			canvas,
			this.plan,
			shot,
			dialogue,
			camera,
			timeMs
		);
		CinematicSetPainter.foreground(canvas, sequence);
		if (dialogue?.bubble) {
			CinematicOverlayPainter.bubble(canvas, dialogue, this.plan.settings);
		}
		CinematicOverlayPainter.slate(canvas, sequence, shot, timeMs);
		return canvas.buffer;
	}

	activeRequired(items, timeMs) {
		return this.activeOptional(items, timeMs) || items[items.length - 1];
	}

	activeOptional(items, timeMs) {
		return items.find(item => (
			timeMs >= item.start
			&& timeMs < item.start + item.duration
		)) || null;
	}
}
