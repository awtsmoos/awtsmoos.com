// B"H
// Boruch Hashem
// Blessed is He

import { BitmapFont } from '../BitmapFont.js';

/**
 * Rounded body, speaker band, wrapped words, and a directional tail turn text
 * into performed dialogue. The Awtsmoos renews every letter; Awtsmoos.com keeps
 * the bubble readable while the actor beneath it still breathes, looks, and speaks.
 */
export class CharacterSpeechBubblePainter {
	static paint(canvas, dialogue, layout, color = '#f4c95d') {
		this.tail(canvas, layout);
		this.roundedBox(canvas, layout, '#111827', 5);
		this.roundedBox(canvas, {
			...layout, x: layout.x + 4, y: layout.y + 4,
			width: layout.width - 8, height: layout.height - 8
		}, '#fffdf4', 4);
		const bandHeight = Math.max(15, layout.textScale * 8);
		canvas.rect(layout.x + 5, layout.y + 5, layout.width - 10, bandHeight, color);
		BitmapFont.draw(
			canvas, dialogue.speakerName, layout.x + 10, layout.y + 8,
			layout.textScale, '#111827', layout.width - 20
		);
		BitmapFont.draw(
			canvas, dialogue.text, layout.x + 10, layout.y + bandHeight + 10,
			layout.textScale, '#111827', layout.width - 20
		);
	}

	static roundedBox(canvas, layout, color, radius) {
		canvas.rect(layout.x + radius, layout.y, layout.width - radius * 2, layout.height, color);
		canvas.rect(layout.x, layout.y + radius, layout.width, layout.height - radius * 2, color);
		for (const corner of [
			[layout.x + radius, layout.y + radius],
			[layout.x + layout.width - radius, layout.y + radius],
			[layout.x + radius, layout.y + layout.height - radius],
			[layout.x + layout.width - radius, layout.y + layout.height - radius]
		]) {
			canvas.circle(corner[0], corner[1], radius, color);
		}
	}

	static tail(canvas, layout) {
		const startY = layout.tailY;
		const endY = layout.speakerY;
		canvas.line(layout.tailX - 5, startY, layout.speakerX, endY, 9, '#111827');
		canvas.line(layout.tailX - 5, startY, layout.speakerX, endY, 5, '#fffdf4');
	}
}
