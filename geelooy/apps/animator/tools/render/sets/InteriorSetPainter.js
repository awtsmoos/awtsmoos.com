// B"H
// Boruch Hashem
// Blessed is He

/**
 * Interior architecture carries pressure through lines, frames, stairs, shelves,
 * glass, and machinery. The Awtsmoos renews each enclosed world while
 * Awtsmoos.com gives every room its own navigable cinematic silhouette.
 */
export class InteriorSetPainter {
	static paint(canvas, sequence, colors, timeMs) {
		canvas.rect(0, 0, canvas.width, 306, colors[0]);
		canvas.rect(0, 64, canvas.width, 242, colors[1]);
		({
			scienceExhibition: () => this.exhibition(canvas, colors, timeMs),
			schoolCorridor: () => this.corridor(canvas, colors),
			subwayTunnel: () => this.tunnel(canvas, colors),
			libraryArchive: () => this.library(canvas, colors),
			glassGreenhouse: () => this.greenhouse(canvas, colors),
			towerStairwell: () => this.stairwell(canvas, colors),
			powerStation: () => this.station(canvas, colors, timeMs)
		}[sequence.environment] || (() => this.generic(canvas, colors)))();
	}

	static exhibition(canvas, colors, timeMs) {
		for (let index = 0; index < 6; index += 1) {
			const x = 35 + index * 104;
			canvas.rect(x, 218, 76, 50, index % 2 ? '#475a78' : '#607895');
			canvas.circle(x + 38, 204, 10 + Math.sin(timeMs / 360 + index) * 3, colors[3]);
		}
		canvas.line(42, 74, 598, 74, 5, '#e8f3ff');
	}

	static corridor(canvas, colors) {
		for (let index = 0; index < 10; index += 1) {
			const x = index * 68;
			canvas.rect(x, 92, 55, 164, index % 2 ? '#71849b' : '#5b6d83');
			canvas.rect(x + 9, 112, 37, 10, colors[3]);
		}
		canvas.line(0, 282, 640, 234, 4, '#f2d37a');
	}

	static tunnel(canvas, colors) {
		for (let index = 0; index < 9; index += 1) {
			const x = index * 84 - 24;
			canvas.outlineEllipse(x, 204, 78, 174, 5, '#202a38');
		}
		canvas.line(0, 286, 640, 250, 6, '#8294a7');
		canvas.line(0, 310, 640, 274, 4, colors[3]);
	}

	static library(canvas, colors) {
		for (let column = 0; column < 5; column += 1) {
			const x = 24 + column * 126;
			canvas.rect(x, 82, 104, 188, '#49382f');
			for (let row = 0; row < 7; row += 1) {
				canvas.rect(x + 8, 94 + row * 24, 88, 16, row % 2 ? '#9d664d' : '#6f8f7d');
			}
		}
	}

	static greenhouse(canvas, colors) {
		for (let index = 0; index < 8; index += 1) {
			const x = index * 92 - 10;
			canvas.line(x, 48, x + 38, 286, 3, '#d9f3ea');
			canvas.line(x + 84, 48, x + 38, 286, 3, '#d9f3ea');
			canvas.circle(x + 42, 238 - (index % 3) * 28, 22, colors[3]);
		}
	}

	static stairwell(canvas, colors) {
		for (let index = 0; index < 8; index += 1) {
			const x = index * 84 - 20;
			const y = 278 - index * 24;
			canvas.rect(x, y, 92, 13, '#8c98a6');
			canvas.line(x + 4, y, x + 4, y - 46, 3, colors[3]);
		}
	}

	static station(canvas, colors, timeMs) {
		for (let index = 0; index < 6; index += 1) {
			const x = 40 + index * 104;
			canvas.outlineEllipse(x, 160, 30, 30, 6, index % 2 ? colors[3] : '#ff8a5b');
			canvas.line(x, 160, x + Math.cos(timeMs / 280 + index) * 22, 160 + Math.sin(timeMs / 280 + index) * 22, 4, '#f7fbff');
		}
		canvas.rect(72, 226, 496, 44, '#1c2634');
	}

	static generic(canvas, colors) {
		for (let index = 0; index < 6; index += 1) {
			canvas.rect(28 + index * 104, 96, 70, 116, index % 2 ? colors[0] : '#26334b');
		}
	}
}
