// B"H
// Boruch Hashem
// Blessed is He

import { BitmapFont } from './BitmapFont.js';

/**
 * Dialogue, title cards, captions, and editorial slates occupy safe vessels.
 * The Awtsmoos renews word and image together while Awtsmoos.com keeps every
 * overlay unclipped, timed, readable, and shared by preview and final export.
 */
export class CinematicOverlayPainter {
	static bubble(canvas, dialogue, settings) {
		const margin = Math.max(18, Number(settings.bubbleSafeMargin || 24));
		const width = canvas.width - margin * 2;
		canvas.rect(margin - 4, margin - 4, width + 8, 66, '#111827');
		canvas.rect(margin, margin, width, 58, '#fffdf4');
		BitmapFont.draw(
			canvas, `${dialogue.speakerName}: ${dialogue.text}`,
			margin + 12, margin + 10, 2, '#111827', width - 24
		);
	}

	static titleCard(canvas, card) {
		canvas.rect(0, 0, canvas.width, canvas.height, '#162033');
		canvas.rect(28, 28, canvas.width - 56, canvas.height - 56, '#f4c95d');
		canvas.rect(34, 34, canvas.width - 68, canvas.height - 68, '#162033');
		const titleScale = canvas.width >= 1000 ? 5 : 3;
		const subtitleScale = canvas.width >= 1000 ? 3 : 2;
		BitmapFont.draw(
			canvas, card.text, this.center(canvas, card.text, titleScale),
			canvas.height * 0.42, titleScale, '#fffdf4'
		);
		if (card.subtitle) {
			BitmapFont.draw(
				canvas, card.subtitle, this.center(canvas, card.subtitle, subtitleScale),
				canvas.height * 0.58, subtitleScale, '#f4c95d'
			);
		}
	}

	static textBox(canvas, box) {
		const width = Math.min(canvas.width - 48, Math.max(310, box.text.length * 13));
		const x = (canvas.width - width) / 2;
		const y = canvas.height - 86;
		canvas.rect(x - 4, y - 4, width + 8, 42, '#111827');
		canvas.rect(x, y, width, 34, '#f4c95d');
		BitmapFont.draw(canvas, box.text, x + 12, y + 10, 2, '#111827', width - 24);
	}

	static slate(canvas, sequence, shot, timeMs) {
		const y = canvas.height - 32;
		canvas.rect(10, y, Math.min(410, canvas.width - 80), 24, '#090d18');
		BitmapFont.draw(
			canvas, `${sequence.name} / ${shot.camera.size} ${shot.camera.angle}`,
			16, y + 6, 1, '#f8fafc', Math.min(390, canvas.width - 100)
		);
		const seconds = Math.floor(timeMs / 1000);
		const clock = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
		BitmapFont.draw(canvas, clock, canvas.width - 70, y + 10, 1, '#f8fafc');
	}

	static center(canvas, text, scale) {
		return Math.max(24, (canvas.width - String(text).length * scale * 6) / 2);
	}
}
