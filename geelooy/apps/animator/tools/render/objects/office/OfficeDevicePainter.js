// B"H
// Boruch Hashem
// Blessed is He

import { BitmapFont } from '../../BitmapFont.js';

/**
 * Coffee machine, printer, laptop, and clock reveal panels, hinges, trays, glass,
 * indicators, and working state. The Awtsmoos renews each mechanism;
 * Awtsmoos.com makes the joke emerge through believable objects that truly operate.
 */
export class OfficeDevicePainter {
	static coffeeMachine(canvas, x, y, scale, state = {}) {
		canvas.ellipse(x + 32 * scale, y + 70 * scale, 38 * scale, 7 * scale, '#222a33');
		canvas.rect(x, y, 64 * scale, 66 * scale, '#111820');
		canvas.rect(x + 4 * scale, y + 4 * scale, 56 * scale, 58 * scale, '#77828d');
		canvas.rect(x + 10 * scale, y + 9 * scale, 44 * scale, 18 * scale, '#202936');
		canvas.rect(x + 13 * scale, y + 12 * scale, 38 * scale, 12 * scale, state.flash ? '#ff6b6b' : '#8fd5c8');
		BitmapFont.draw(canvas, state.text || '1 CUP', x + 18 * scale, y + 15 * scale, Math.max(1, scale), '#111827', 30 * scale);
		canvas.rect(x + 20 * scale, y + 32 * scale, 24 * scale, 22 * scale, '#1e2630');
		canvas.line(x + 32 * scale, y + 28 * scale, x + 32 * scale, y + 42 * scale, 4 * scale, '#2f3742');
		canvas.rect(x + 15 * scale, y + 57 * scale, 34 * scale, 5 * scale, '#343d47');
		if (state.steam) {
			for (const offset of [-7, 2, 9]) {
				canvas.line(x + (32 + offset) * scale, y + 30 * scale, x + (35 + offset) * scale, y + 15 * scale, 1.2 * scale, '#e4eef6');
			}
		}
	}

	static laptop(canvas, x, y, scale, state = {}) {
		canvas.rect(x, y, 54 * scale, 35 * scale, '#171e28');
		canvas.rect(x + 3 * scale, y + 3 * scale, 48 * scale, 28 * scale, state.flash ? '#ffd166' : '#6db8cf');
		canvas.line(x + 27 * scale, y + 35 * scale, x + 38 * scale, y + 47 * scale, 4 * scale, '#2b3440');
		canvas.rect(x - 5 * scale, y + 45 * scale, 72 * scale, 7 * scale, '#343d48');
		for (let key = 0; key < 8; key += 1) {
			canvas.rect(x + key * 8 * scale, y + 47 * scale, 5 * scale, 2 * scale, '#788592');
		}
	}

	static printer(canvas, x, y, scale, state = {}) {
		canvas.ellipse(x + 36 * scale, y + 55 * scale, 42 * scale, 6 * scale, '#242c36');
		canvas.rect(x, y + 10 * scale, 72 * scale, 42 * scale, '#1b222c');
		canvas.rect(x + 4 * scale, y + 14 * scale, 64 * scale, 34 * scale, '#7b8793');
		canvas.rect(x + 15 * scale, y, 42 * scale, 18 * scale, '#ece9df');
		canvas.rect(x + 18 * scale, y + 25 * scale, 36 * scale, 12 * scale, '#202832');
		canvas.circle(x + 62 * scale, y + 20 * scale, 3 * scale, state.flash ? '#ff6b6b' : '#6ee7a5');
		if (state.printing) {
			canvas.rect(x + 17 * scale, y + 38 * scale, 38 * scale, 20 * scale, '#fff4b8');
		}
	}

	static wallClock(canvas, x, y, scale, state = {}) {
		canvas.circle(x, y, 19 * scale, '#222a33');
		canvas.circle(x, y, 16 * scale, '#f6f2e8');
		const seconds = Number(state.seconds || 0);
		const minuteAngle = seconds / 60 * Math.PI * 2 - Math.PI / 2;
		canvas.line(x, y, x + Math.cos(minuteAngle) * 11 * scale, y + Math.sin(minuteAngle) * 11 * scale, 2 * scale, '#222a33');
		canvas.line(x, y, x - 6 * scale, y - 5 * scale, 3 * scale, '#222a33');
		canvas.circle(x, y, 2 * scale, '#d95656');
	}
}
