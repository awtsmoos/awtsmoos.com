// B"H
// Boruch Hashem
// Blessed is He

import { BitmapFont } from './BitmapFont.js';
import { OfficeSmallObjectPainter } from './objects/office/OfficeSmallObjectPainter.js';

/**
 * A hand prop becomes recognizable material at the point of contact. The
 * Awtsmoos renews card, tablet, mug, spoon, gauge, and tool; Awtsmoos.com keeps
 * carried objects consistent with the same constructed world beneath the light.
 */
export class CartoonPropPainter {
	static paint(canvas, prop, x, y, scale) {
		if (!prop) return;
		if (prop === 'mug') return OfficeSmallObjectPainter.mug(canvas, x, y, scale * 0.72, { steam: true });
		if (prop === 'spoon') return OfficeSmallObjectPainter.spoon(canvas, x, y, scale * 0.8, { rotation: -0.7 });
		const method = {
			forecastTablet: 'tablet', umbrella: 'umbrella', signalCard: 'signal',
			meetingCards: 'cards', pressureGauge: 'gauge', arrivalDisplay: 'display',
			toolbox: 'toolbox', nothingButton: 'button', lantern: 'lantern',
			freeTimeCard: 'freeTime', calendar: 'calendar', strategyFolder: 'paper'
		}[prop] || 'paper';
		this[method](canvas, x, y, scale, prop);
	}

	static tablet(canvas, x, y, scale) {
		OfficeSmallObjectPainter.tablet(canvas, x, y, scale * 0.72, { text: 'BOOKED' });
	}

	static umbrella(canvas, x, y, scale) {
		canvas.line(x + 22 * scale, y + 14 * scale, x + 22 * scale, y + 52 * scale, 4 * scale, '#111827');
		canvas.ellipse(x + 22 * scale, y + 12 * scale, 30 * scale, 12 * scale, '#7c3aed');
		canvas.line(x + 22 * scale, y + 52 * scale, x + 30 * scale, y + 58 * scale, 3 * scale, '#111827');
	}

	static signal(canvas, x, y, scale) {
		canvas.rect(x, y, 28 * scale, 44 * scale, '#111827');
		for (const [offset, color] of [[10, '#e63946'], [22, '#ffd166'], [34, '#22c55e']]) {
			canvas.circle(x + 14 * scale, y + offset * scale, 6 * scale, color);
		}
	}

	static cards(canvas, x, y, scale) {
		for (let index = 0; index < 3; index += 1) {
			canvas.rect(x + index * 7 * scale, y + index * 4 * scale, 30 * scale, 20 * scale, '#f8fafc');
			canvas.line(x + 5 * scale + index * 7 * scale, y + 9 * scale + index * 4 * scale, x + 24 * scale + index * 7 * scale, y + 9 * scale + index * 4 * scale, 2 * scale, '#7c3aed');
		}
	}

	static gauge(canvas, x, y, scale) {
		canvas.circle(x + 18 * scale, y + 18 * scale, 18 * scale, '#f8fafc');
		canvas.outlineEllipse(x + 18 * scale, y + 18 * scale, 18 * scale, 18 * scale, 3 * scale, '#111827');
		canvas.line(x + 18 * scale, y + 18 * scale, x + 29 * scale, y + 8 * scale, 3 * scale, '#e63946');
	}

	static display(canvas, x, y, scale) {
		canvas.rect(x, y, 68 * scale, 28 * scale, '#111827');
		BitmapFont.draw(canvas, 'WHENEVER', x + 7 * scale, y + 9 * scale, Math.max(1, scale), '#43c6ac');
	}

	static toolbox(canvas, x, y, scale) {
		canvas.rect(x, y + 8 * scale, 46 * scale, 26 * scale, '#e63946');
		canvas.rect(x + 14 * scale, y, 18 * scale, 12 * scale, '#111827');
		canvas.rect(x + 20 * scale, y + 18 * scale, 7 * scale, 6 * scale, '#ffd166');
	}

	static button(canvas, x, y, scale) {
		canvas.rect(x, y, 46 * scale, 24 * scale, '#111827');
		canvas.circle(x + 23 * scale, y + 12 * scale, 8 * scale, '#00e5ff');
	}

	static lantern(canvas, x, y, scale) {
		canvas.rect(x + 7 * scale, y + 7 * scale, 22 * scale, 32 * scale, '#111827');
		canvas.rect(x + 10 * scale, y + 10 * scale, 16 * scale, 26 * scale, '#ffc857');
	}

	static freeTime(canvas, x, y, scale) {
		canvas.rect(x, y, 46 * scale, 34 * scale, '#f8fafc');
		canvas.rect(x, y, 46 * scale, 9 * scale, '#ff6b6b');
		BitmapFont.draw(canvas, 'FREE', x + 10 * scale, y + 16 * scale, Math.max(1, scale), '#111827');
	}

	static calendar(canvas, x, y, scale) { this.freeTime(canvas, x, y, scale); }
	static paper(canvas, x, y, scale) { OfficeSmallObjectPainter.papers(canvas, x, y, scale * 0.6); }
}
