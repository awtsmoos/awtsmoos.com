// B"H
// Boruch Hashem
// Blessed is He

/**
 * Exterior worlds carry distance, weather, traffic, water, cables, roofs, and
 * dawn. The Awtsmoos renews every horizon while Awtsmoos.com builds readable
 * foreground, midground, and skyline layers for continuous action.
 */
export class ExteriorSetPainter {
	static paint(canvas, sequence, colors, timeMs) {
		canvas.rect(0, 0, canvas.width, 210, colors[0]);
		canvas.rect(0, 210, canvas.width, 96, colors[1]);
		({
			floodedStreet: () => this.flood(canvas, colors, timeMs),
			marketCanopy: () => this.market(canvas, colors),
			riverBridge: () => this.bridge(canvas, colors),
			rooftopGardens: () => this.rooftop(canvas, colors),
			dawnPlaza: () => this.plaza(canvas, colors, timeMs)
		}[sequence.environment] || (() => this.city(canvas, colors)))();
	}

	static flood(canvas, colors, timeMs) {
		this.city(canvas, colors);
		canvas.rect(0, 244, 640, 62, '#426b88');
		for (let index = 0; index < 14; index += 1) {
			const x = index * 52 + Math.sin(timeMs / 220 + index) * 18;
			canvas.line(x, 252 + index % 4 * 10, x + 34, 248 + index % 4 * 10, 2, '#bfe8ff');
		}
		canvas.rect(420, 190, 156, 70, '#d9aa32');
	}

	static market(canvas, colors) {
		for (let index = 0; index < 7; index += 1) {
			const x = index * 96 - 18;
			canvas.line(x, 110, x + 46, 64, 6, index % 2 ? '#ef476f' : '#ffd166');
			canvas.line(x + 46, 64, x + 92, 110, 6, index % 2 ? '#ef476f' : '#ffd166');
			canvas.rect(x + 4, 112, 84, 96, index % 2 ? '#8d5a4b' : '#5f7a61');
		}
		canvas.line(0, 74, 640, 126, 3, colors[3]);
	}

	static bridge(canvas, colors) {
		canvas.rect(0, 246, 640, 60, '#3c5268');
		canvas.rect(0, 302, 640, 4, '#a7e8ff');
		for (const x of [86, 554]) {
			canvas.rect(x - 9, 82, 18, 164, '#343d4c');
			canvas.line(x, 82, 320, 246, 4, colors[3]);
		}
		for (let index = 0; index < 10; index += 1) {
			canvas.line(50 + index * 60, 184, 50 + index * 60, 246, 2, '#9ba9bb');
		}
	}

	static rooftop(canvas, colors) {
		this.city(canvas, colors);
		canvas.rect(0, 252, 640, 54, colors[2]);
		for (let index = 0; index < 8; index += 1) {
			const x = 28 + index * 78;
			canvas.rect(x, 228, 56, 28, '#6d523f');
			canvas.circle(x + 16, 220, 16, index % 2 ? '#4fa568' : '#6fcf75');
			canvas.circle(x + 40, 218, 14, '#3e8e5c');
		}
	}

	static plaza(canvas, colors, timeMs) {
		for (let index = 0; index < 8; index += 1) {
			const height = 52 + (index % 3) * 28;
			canvas.rect(index * 86 - 12, 210 - height, 70, height, index % 2 ? '#78889b' : '#637184');
		}
		const sunX = 120 + Math.sin(timeMs / 12000) * 18;
		canvas.circle(sunX, 68, 34, colors[3]);
		for (let index = 0; index < 11; index += 1) {
			canvas.line(320, 244, index * 64, 306, 2, '#d8c4a1');
		}
	}

	static city(canvas, colors) {
		for (let index = 0; index < 9; index += 1) {
			const height = 48 + (index % 4) * 28;
			canvas.rect(index * 78 - 10, 210 - height, 64, height, index % 2 ? '#465871' : '#596b82');
		}
	}
}
