// B"H
// Boruch Hashem
// Blessed is He

import { BitmapFont } from './BitmapFont.js';

/**
 * Walls, corridors, tables, calendars, and the runaway plan become one living
 * set. The Awtsmoos renews foreground and background as distinct depth vessels.
 */
export class CinematicSetPainter {
	static background(canvas, sequenceId, timeMs) {
		const palettes = {
			seq_briefing: ['#b9d8e8', '#d8c3a5', '#415a77'],
			seq_escape: ['#e9c46a', '#f4a261', '#264653'],
			seq_chase: ['#8ecae6', '#219ebc', '#023047'],
			seq_negotiation: ['#cdb4db', '#ffc8dd', '#6d597a'],
			seq_tag: ['#a7c957', '#f2e8cf', '#386641']
		};
		const [sky, wall, floor] = palettes[sequenceId];
		canvas.clear(sky);
		canvas.rect(0, 80, canvas.width, 205, wall);
		canvas.rect(0, 285, canvas.width, 75, floor);
		canvas.rect(0, 278, canvas.width, 8, '#111827');
		const parallax = Math.sin(timeMs / 3000) * 8;
		canvas.rect(48 + parallax, 105, 130, 88, '#f8fafc');
		canvas.rect(54 + parallax, 111, 118, 76, '#457b9d');
		canvas.line(113 + parallax, 111, 113 + parallax, 187, 4, '#f8fafc');
		canvas.line(54 + parallax, 149, 172 + parallax, 149, 4, '#f8fafc');
	}

	static setDressing(canvas, sequenceId, timeMs) {
		if (['seq_briefing', 'seq_negotiation'].includes(sequenceId)) {
			this.strategyTable(canvas);
		}
		if (['seq_escape', 'seq_chase'].includes(sequenceId)) {
			this.hallway(canvas, timeMs);
		}
		if (sequenceId === 'seq_tag') this.calendar(canvas);
	}

	static strategyTable(canvas) {
		canvas.rect(210, 225, 225, 18, '#5b3a29');
		canvas.rect(228, 243, 14, 48, '#3d2b1f');
		canvas.rect(402, 243, 14, 48, '#3d2b1f');
		canvas.rect(270, 205, 105, 16, '#f8fafc');
		BitmapFont.draw(canvas, 'STRATEGY', 285, 209, 2, '#111827');
	}

	static hallway(canvas, timeMs) {
		for (let door = 0; door < 4; door += 1) {
			const x = 115 + door * 150 - (timeMs / 35 % 150);
			canvas.rect(x, 145, 82, 140, '#6c584c');
			canvas.circle(x + 66, 220, 4, '#ffd166');
		}
		this.walkingPlan(canvas, 320 + Math.sin(timeMs / 300) * 80, 252);
	}

	static calendar(canvas) {
		canvas.rect(230, 130, 180, 125, '#f8fafc');
		canvas.rect(230, 130, 180, 24, '#e63946');
		BitmapFont.draw(canvas, 'TUESDAY', 270, 166, 3, '#111827');
		canvas.line(278, 255, 260, 292, 10, '#111827');
		canvas.line(362, 255, 382, 292, 10, '#111827');
	}

	static walkingPlan(canvas, x, y) {
		const bounce = Math.sin(x / 18) * 4;
		canvas.rect(x - 34, y - 70 + bounce, 68, 58, '#f8fafc');
		canvas.rect(x - 27, y - 60 + bounce, 54, 5, '#3b82f6');
		canvas.rect(x - 27, y - 47 + bounce, 42, 5, '#3b82f6');
		canvas.line(x - 18, y - 12, x - 28, y + 22, 8, '#111827');
		canvas.line(x + 18, y - 12, x + 28, y + 22, 8, '#111827');
	}

	static foreground(canvas, sequenceId) {
		if (sequenceId !== 'seq_chase') return;
		canvas.rect(0, 326, canvas.width, 34, '#14213d');
		canvas.rect(0, 326, canvas.width, 4, '#fca311');
	}
}
