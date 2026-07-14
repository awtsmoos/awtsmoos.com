// B"H
// Boruch Hashem
// Blessed is He

/**
 * A living set refuses to freeze behind its actors. The Awtsmoos renews clouds,
 * doors, traffic, rain, train lights, machine gauges, and lanterns each instant;
 * Awtsmoos.com gives every environment its own moving supporting cast.
 */
export class CinematicDynamicObjectPainter {
	static paint(canvas, sequence, timeMs) {
		const phase = timeMs / 1000;
		({
			workshop: () => this.workshop(canvas, phase),
			hallway: () => this.hallway(canvas, phase),
			cityStreet: () => this.street(canvas, phase),
			cityPark: () => this.park(canvas, phase),
			rooftop: () => this.rooftop(canvas, phase),
			transitPlatform: () => this.transit(canvas, phase),
			repairLab: () => this.repair(canvas, phase),
			festivalPlaza: () => this.festival(canvas, phase)
		}[sequence.environment] || (() => {}))();
	}

	static workshop(canvas, phase) {
		const pulse = 10 + Math.sin(phase * 4) * 8;
		canvas.circle(526, 112, 22 + pulse * 0.15, '#00e5ff');
		canvas.outlineEllipse(526, 112, 30, 30, 3, '#111827');
		for (let index = 0; index < 5; index += 1) {
			canvas.rect(86 + index * 80, 268 - (index % 2) * 14, 48, 14, index % 2 ? '#ff7a59' : '#ffd166');
		}
	}

	static hallway(canvas, phase) {
		const door = Math.max(0, Math.sin(phase * 2)) * 58;
		canvas.rect(520 + door, 90, 70, 212, '#18233e');
		canvas.circle(532 + door, 196, 5, '#ffd166');
		canvas.line(58, 72, 560, 72, 7, '#f8fafc');
	}

	static street(canvas, phase) {
		for (let index = 0; index < 3; index += 1) {
			const x = ((phase * (52 + index * 14) + index * 210) % 820) - 120;
			canvas.rect(x, 254 + index * 9, 86, 28, ['#e63946', '#2563eb', '#f59e0b'][index]);
			canvas.circle(x + 18, 284 + index * 9, 9, '#111827');
			canvas.circle(x + 68, 284 + index * 9, 9, '#111827');
		}
		this.cloud(canvas, 90 + Math.sin(phase * 0.4) * 70, 62, 1);
	}

	static park(canvas, phase) {
		for (let index = 0; index < 6; index += 1) {
			const x = 70 + index * 96 + Math.sin(phase * 1.2 + index) * 12;
			canvas.circle(x, 82 + Math.cos(phase + index) * 5, 22, index % 2 ? '#3fa34d' : '#59b967');
			canvas.rect(x - 4, 98, 8, 104, '#67412d');
		}
		canvas.rect(248, 248, 150, 36, '#f7d070');
	}

	static rooftop(canvas, phase) {
		for (let index = 0; index < 28; index += 1) {
			const x = (index * 53 + phase * 120) % 700 - 30;
			const y = (index * 37 + phase * 180) % 340;
			canvas.line(x, y, x - 10, y + 20, 2, '#a5d8ff');
		}
		if (Math.floor(phase * 2) % 7 === 0) {
			canvas.line(420, 20, 382, 98, 5, '#f8fafc');
			canvas.line(382, 98, 430, 142, 5, '#bb86fc');
		}
	}

	static transit(canvas, phase) {
		const trainX = 700 - (phase * 90 % 1040);
		canvas.rect(trainX, 182, 480, 100, '#cbd5e1');
		for (let index = 0; index < 6; index += 1) {
			canvas.rect(trainX + 28 + index * 72, 200, 48, 32, '#1e3a5f');
		}
		canvas.rect(210, 74, 220, 38, '#101827');
	}

	static repair(canvas, phase) {
		for (let index = 0; index < 4; index += 1) {
			const angle = phase * (0.8 + index * 0.12);
			const x = 138 + index * 120;
			canvas.outlineEllipse(x, 120, 30, 30, 5, index % 2 ? '#00e5ff' : '#f97316');
			canvas.line(x, 120, x + Math.cos(angle) * 24, 120 + Math.sin(angle) * 24, 4, '#f8fafc');
		}
	}

	static festival(canvas, phase) {
		for (let index = 0; index < 18; index += 1) {
			const x = 30 + index * 36;
			const y = 60 + Math.sin(phase * 1.4 + index * 0.7) * 16;
			canvas.line(x, 0, x, y - 7, 1, '#f8fafc');
			canvas.circle(x, y, 7 + Math.sin(phase * 2 + index) * 2, index % 3 ? '#ffc857' : '#ff6b6b');
		}
	}

	static cloud(canvas, x, y, scale) {
		canvas.circle(x, y, 22 * scale, '#f8fafc');
		canvas.circle(x + 24 * scale, y - 8 * scale, 28 * scale, '#f8fafc');
		canvas.circle(x + 52 * scale, y, 22 * scale, '#f8fafc');
	}
}
