// B"H
// Boruch Hashem
// Blessed is He

import { BitmapFont } from './BitmapFont.js';

/**
 * Dialogue and editorial context occupy protected screen vessels. The Awtsmoos
 * renews word and image together while Awtsmoos.com keeps bubbles clear of
 * expressive faces and reports location, camera, and elapsed story time.
 */
export class CinematicOverlayPainter {
	static bubble(canvas, dialogue, settings) {
		const margin = Math.max(18, Number(settings.bubbleSafeMargin || 24));
		const width = canvas.width - margin * 2;
		canvas.rect(margin - 4, margin - 4, width + 8, 62, '#111827');
		canvas.rect(margin, margin, width, 54, '#fffdf4');
		BitmapFont.draw(
			canvas,
			`${dialogue.speakerName}: ${dialogue.text}`,
			margin + 12,
			margin + 10,
			2,
			'#111827',
			width - 24
		);
	}

	static slate(canvas, sequence, shot, timeMs) {
		canvas.rect(10, 328, 410, 24, '#090d18');
		BitmapFont.draw(
			canvas,
			`${sequence.name} / ${shot.camera.size} ${shot.camera.angle}`,
			16,
			334,
			1,
			'#f8fafc'
		);
		const seconds = Math.floor(timeMs / 1000);
		const clock = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
		BitmapFont.draw(canvas, clock, 570, 338, 1, '#f8fafc');
	}
}
