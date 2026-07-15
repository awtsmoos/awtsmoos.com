// B"H
// Boruch Hashem
// Blessed is He

import { CinematicCameraResolver } from './CinematicCameraResolver.js';
import { CinematicCastPainter } from './CinematicCastPainter.js';
import { CinematicLightingResolver } from './CinematicLightingResolver.js';
import { CinematicOverlayPainter } from './CinematicOverlayPainter.js';
import { CinematicSetPainter } from './CinematicSetPainter.js';
import { PixelCanvas } from './PixelCanvas.js';

/**
 * One frame joins story time, camera intention, environmental light, blocking,
 * acting, action objects, and readable dialogue. The Awtsmoos renews this whole
 * world each instant while Awtsmoos.com keeps every source editable as JSON.
 */
export class CinematicFrameRenderer {
	constructor(plan) {
		this.plan = plan;
		this.canvas = new PixelCanvas(plan.settings.width, plan.settings.height);
	}

	render(timeMs) {
		const context = this.context(timeMs);
		if (!context.shot || !context.sequence) {
			this.canvas.clear('#090d18');
			return this.canvas.buffer;
		}
		CinematicSetPainter.paint(
			this.canvas,
			context.sequence,
			context.camera,
			timeMs
		);
		CinematicCastPainter.paint(
			this.canvas,
			this.plan,
			context.shot,
			context.camera,
			context.dialogue,
			timeMs,
			context.lighting
		);
		this.weatherFlash(context.lighting);
		if (context.dialogue?.bubble) {
			CinematicOverlayPainter.bubble(
				this.canvas,
				context.dialogue,
				this.plan.settings
			);
		}
		CinematicOverlayPainter.slate(
			this.canvas,
			context.sequence,
			context.shot,
			timeMs
		);
		return this.canvas.buffer;
	}

	context(timeMs) {
		const shot = this.active(this.plan.shots, timeMs);
		const sequence = shot
			? this.plan.sequences.find((item) => item.id === shot.sequenceId)
			: this.active(this.plan.sequences, timeMs);
		const dialogue = (this.plan.dialogue || []).find((line) => {
			return timeMs >= line.start && timeMs < line.start + line.duration;
		}) || null;
		const camera = shot
			? CinematicCameraResolver.resolve(shot, timeMs)
			: null;
		const lighting = sequence && shot
			? CinematicLightingResolver.resolve(sequence, shot, timeMs)
			: {};
		return { shot, sequence, dialogue, camera, lighting };
	}

	active(items, timeMs) {
		return (items || []).find((item) => {
			return timeMs >= item.start && timeMs < item.start + item.duration;
		}) || null;
	}

	weatherFlash(lighting) {
		if (!lighting.flash) return;
		for (let index = 0; index < 18; index += 1) {
			this.canvas.line(
				0,
				index * 20,
				this.canvas.width,
				index * 20,
				1,
				'#eaf7ff'
			);
		}
	}
}
