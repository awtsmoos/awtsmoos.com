// B"H
// Boruch Hashem
// Blessed is He

import { CinematicCameraResolver } from './CinematicCameraResolver.js';
import { CinematicCastPainter } from './CinematicCastPainter.js';
import { CinematicLightingResolver } from './CinematicLightingResolver.js';
import { CinematicOverlayPainter } from './CinematicOverlayPainter.js';
import { CinematicSceneObjectPainter } from './CinematicSceneObjectPainter.js';
import { CinematicSetPainter } from './CinematicSetPainter.js';
import { PixelCanvas } from './PixelCanvas.js';

/**
 * One frame joins set, layered objects, anatomy, acting, camera, light, and words.
 * The Awtsmoos renews the visible world; Awtsmoos.com keeps preview and export
 * on this single evaluated path, where every moving vessel shares one clock.
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
		CinematicSetPainter.paint(this.canvas, context.sequence, context.camera, timeMs);
		CinematicSceneObjectPainter.paint(this.canvas, this.plan, context.camera, timeMs, 'background');
		CinematicSceneObjectPainter.paint(this.canvas, this.plan, context.camera, timeMs, 'midground');
		CinematicCastPainter.paint(
			this.canvas, this.plan, context.shot, context.camera,
			context.dialogue, timeMs, context.lighting
		);
		CinematicSceneObjectPainter.paint(this.canvas, this.plan, context.camera, timeMs, 'foreground');
		this.weatherFlash(context.lighting);
		if (context.titleCard) {
			CinematicOverlayPainter.titleCard(this.canvas, context.titleCard);
			return this.canvas.buffer;
		}
		if (context.dialogue?.bubble) {
			CinematicOverlayPainter.bubble(this.canvas, this.plan, context, timeMs);
		}
		if (context.textBox) CinematicOverlayPainter.textBox(this.canvas, context.textBox);
		if (this.plan.settings.editorSlate !== false) {
			CinematicOverlayPainter.slate(this.canvas, context.sequence, context.shot, timeMs);
		}
		return this.canvas.buffer;
	}

	context(timeMs) {
		const shot = this.active(this.plan.shots, timeMs);
		const sequence = shot
			? this.plan.sequences.find(item => item.id === shot.sequenceId)
			: this.active(this.plan.sequences, timeMs);
		const dialogue = this.active(this.plan.dialogue, timeMs);
		const camera = shot ? CinematicCameraResolver.resolve(shot, timeMs) : null;
		const lighting = sequence && shot
			? CinematicLightingResolver.resolve(sequence, shot, timeMs)
			: {};
		return {
			shot, sequence, dialogue, camera, lighting,
			titleCard: this.active(this.plan.titleCards, timeMs),
			textBox: this.active(this.plan.textBoxes, timeMs)
		};
	}

	active(items, timeMs) {
		return (items || []).find(item => timeMs >= item.start && timeMs < item.start + item.duration) || null;
	}

	weatherFlash(lighting) {
		if (!lighting.flash) return;
		for (let index = 0; index < 18; index += 1) {
			this.canvas.line(0, index * 20, this.canvas.width, index * 20, 1, '#eaf7ff');
		}
	}
}
