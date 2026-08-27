// B"H
// Boruch Hashem
// Blessed is He

/**
 * Window light, ceiling panels, walls, glass, shelves, counters, cables, and floor
 * perspective create a believable office lounge. The Awtsmoos renews each plane;
 * Awtsmoos.com gives actors and objects a spatial world with depth in every frame.
 */
export class RealisticOfficeSetPainter {
	static paint(canvas, colors, timeMs) {
		const sx = canvas.width / 640;
		const sy = canvas.height / 360;
		const x = value => value * sx;
		const y = value => value * sy;
		const s = Math.min(sx, sy);
		canvas.rect(0, 0, canvas.width, canvas.height, '#d8d7d1');
		canvas.rect(0, y(54), canvas.width, y(252), '#b8c0c6');
		this.ceiling(canvas, x, y, s);
		this.windows(canvas, x, y, s, timeMs);
		this.wallPanels(canvas, x, y, s);
		this.machineStation(canvas, x, y, s);
		this.printerCounter(canvas, x, y, s);
		this.floor(canvas, x, y, s);
	}

	static ceiling(canvas, x, y, scale) {
		canvas.rect(0, 0, x(640), y(54), '#eef0ed');
		for (let index = 0; index < 8; index += 1) {
			canvas.line(x(index * 92), 0, x(index * 72 + 26), y(54), scale, '#b9c0c4');
		}
		for (const lightX of [120, 320, 520]) {
			canvas.rect(x(lightX - 42), y(18), x(84), y(10), '#fff9cf');
		}
	}

	static windows(canvas, x, y, scale, timeMs) {
		for (let index = 0; index < 3; index += 1) {
			const windowX = 24 + index * 120;
			canvas.rect(x(windowX), y(74), x(96), y(104), '#344351');
			canvas.rect(x(windowX + 5), y(79), x(86), y(94), index % 2 ? '#93b8c7' : '#a8c9d6');
			canvas.line(x(windowX + 48), y(79), x(windowX + 48), y(173), 2 * scale, '#e3eef1');
			canvas.line(x(windowX + 5), y(126), x(windowX + 91), y(126), 2 * scale, '#e3eef1');
		}
		const light = 20 + Math.sin(timeMs / 4000) * 4;
		canvas.line(x(64), y(178), x(160), y(306), light * 0.08 * scale, '#dce8df');
	}

	static wallPanels(canvas, x, y, scale) {
		for (let index = 0; index < 5; index += 1) {
			canvas.line(x(index * 132), y(184), x(index * 132), y(306), scale, '#929da5');
		}
		canvas.rect(x(420), y(72), x(190), y(20), '#5a6670');
		canvas.rect(x(438), y(96), x(154), y(78), '#7b8790');
	}

	static machineStation(canvas, x, y, scale) {
		canvas.rect(x(406), y(176), x(110), y(16), '#5b4437');
		canvas.rect(x(414), y(190), x(12), y(68), '#4a5158');
		canvas.rect(x(496), y(190), x(12), y(68), '#4a5158');
		canvas.line(x(418), y(248), x(504), y(248), 3 * scale, '#68737d');
	}

	static printerCounter(canvas, x, y, scale) {
		canvas.rect(x(526), y(192), x(94), y(66), '#505b64');
		canvas.rect(x(532), y(198), x(82), y(10), '#75818a');
		canvas.line(x(550), y(258), x(550), y(306), 5 * scale, '#444d55');
		canvas.line(x(598), y(258), x(598), y(306), 5 * scale, '#444d55');
	}

	static floor(canvas, x, y, scale) {
		canvas.rect(0, y(258), x(640), y(102), '#6d7478');
		for (let index = -3; index < 13; index += 1) {
			canvas.line(x(320), y(258), x(index * 64), y(360), scale, '#8b9296');
		}
		for (const floorY of [280, 310, 340]) {
			canvas.line(0, y(floorY), x(640), y(floorY), scale, '#858c90');
		}
	}
}
