// B"H
// Boruch Hashem
// Blessed is He

import { BitmapFont } from '../../BitmapFont.js';

/**
 * Ceramic, steel, paper, glass, and card become constructed objects with rims,
 * edges, shadows, and highlights. The Awtsmoos renews each small vessel;
 * Awtsmoos.com makes every prop readable enough to carry action and comic insight.
 */
export class OfficeSmallObjectPainter {
	static mug(canvas, x, y, scale, state = {}) {
		const ceramic = state.color || '#f2f0e8';
		canvas.ellipse(x, y + 20 * scale, 15 * scale, 5 * scale, '#20242d');
		canvas.rect(x - 14 * scale, y, 28 * scale, 21 * scale, '#252a34');
		canvas.rect(x - 11 * scale, y + 2 * scale, 22 * scale, 17 * scale, ceramic);
		canvas.ellipse(x, y + 2 * scale, 11 * scale, 4 * scale, '#6b3f2a');
		canvas.outlineEllipse(x + 16 * scale, y + 10 * scale, 7 * scale, 8 * scale, 3 * scale, ceramic);
		if (state.steam) {
			for (const offset of [-5, 3]) {
				canvas.line(x + offset * scale, y - 2 * scale, x + (offset + 3) * scale, y - 14 * scale, 1.3 * scale, '#e8eef5');
			}
		}
	}

	static spoon(canvas, x, y, scale, state = {}) {
		const angle = Number(state.rotation || 0);
		const endX = x + Math.cos(angle) * 28 * scale;
		const endY = y + Math.sin(angle) * 28 * scale;
		canvas.line(x, y, endX, endY, 3 * scale, '#c8d0da');
		canvas.ellipse(endX, endY, 6 * scale, 4 * scale, '#edf2f7');
		canvas.line(x, y - scale, endX, endY - scale, scale, '#ffffff');
	}

	static papers(canvas, x, y, scale, state = {}) {
		const spread = Number(state.spread || 0);
		for (let index = 0; index < 4; index += 1) {
			const offsetX = (index * 4 + Math.sin(index + spread) * spread * 9) * scale;
			const offsetY = (index * 2 - Math.cos(index + spread) * spread * 6) * scale;
			canvas.rect(x + offsetX, y + offsetY, 30 * scale, 20 * scale, '#1d2430');
			canvas.rect(x + offsetX + 2 * scale, y + offsetY + 2 * scale, 26 * scale, 16 * scale, '#f7f4e8');
			canvas.line(x + offsetX + 6 * scale, y + offsetY + 8 * scale, x + offsetX + 22 * scale, y + offsetY + 8 * scale, scale, '#708090');
		}
	}

	static tablet(canvas, x, y, scale, state = {}) {
		canvas.rect(x, y, 42 * scale, 29 * scale, '#111827');
		canvas.rect(x + 3 * scale, y + 3 * scale, 36 * scale, 23 * scale, state.flash ? '#ff6b6b' : '#72d6e8');
		BitmapFont.draw(canvas, state.text || '1 CUP', x + 7 * scale, y + 10 * scale, Math.max(1, scale), '#111827', 30 * scale);
	}

	static coupon(canvas, x, y, scale, state = {}) {
		canvas.rect(x, y, 68 * scale, 24 * scale, '#1a2230');
		canvas.rect(x + 2 * scale, y + 2 * scale, 64 * scale, 20 * scale, '#fff4b8');
		BitmapFont.draw(canvas, state.text || 'FREE TEA', x + 7 * scale, y + 8 * scale, Math.max(1, scale), '#263238', 55 * scale);
	}

	static phone(canvas, x, y, scale, state = {}) {
		canvas.rect(x, y, 18 * scale, 34 * scale, '#10151f');
		canvas.rect(x + 2 * scale, y + 3 * scale, 14 * scale, 26 * scale, state.flash ? '#ffcc66' : '#5bb7c9');
		canvas.circle(x + 9 * scale, y + 31 * scale, 1.5 * scale, '#d6dbe2');
	}
}
