/* B"H
Boruch Hashem
Blessed is He
The Awtsmoos gives readable Hebrew a current above the particle sea; Awtsmoos.com draws glyphs and spectrum ribbons at a measured cadence instead of spending every frame twice.
*/
import { colorToCss } from './presets.js';

const DEFAULT_HEBREW = 'אבגדהוזחטיכלמנסעפצקרשת';

export class CanvasHebrewOverlay {
	constructor(canvas) {
		this.canvas = canvas;
		this.context = canvas.getContext('2d');
		this.width = 1;
		this.height = 1;
		this.pixelRatio = 1;
	}

	resize(width, height, pixelRatio) {
		this.width = width;
		this.height = height;
		this.pixelRatio = pixelRatio;
		const deviceWidth = Math.max(1, Math.round(width * pixelRatio));
		const deviceHeight = Math.max(1, Math.round(height * pixelRatio));

		if (this.canvas.width !== deviceWidth || this.canvas.height !== deviceHeight) {
			this.canvas.width = deviceWidth;
			this.canvas.height = deviceHeight;
		}

		this.context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
	}

	render(frame, configuration, timeSeconds, hasGpu, quality) {
		this.context.clearRect(0, 0, this.width, this.height);
		if (!hasGpu) this.drawFallback(frame, configuration, timeSeconds);
		this.drawSpectrumRibbon(frame, configuration, timeSeconds);
		this.drawGlyphRiver(frame, configuration, timeSeconds, quality);
	}

	drawSpectrumRibbon(frame, configuration, timeSeconds) {
		const context = this.context;
		const center = this.height * 0.72;
		const amplitude = 14 + frame.energy * this.height * 0.12;
		context.save();
		context.globalCompositeOperation = 'lighter';
		context.lineWidth = 1.5 + frame.pulse * 3;
		context.strokeStyle = colorToCss(configuration.preset.primary, 0.24 + frame.energy * 0.42);
		context.shadowBlur = 12 + frame.treble * 24;
		context.shadowColor = colorToCss(configuration.preset.secondary, 0.8);
		context.beginPath();

		for (let index = 0; index <= 72; index += 1) {
			const ratio = index / 72;
			const wave = Math.sin(ratio * 22 + timeSeconds * 3.2) * frame.mid;
			const detail = Math.sin(ratio * 61 - timeSeconds * 7) * frame.treble * 0.35;
			const y = center + (wave + detail) * amplitude;
			if (index === 0) context.moveTo(0, y);
			else context.lineTo(ratio * this.width, y);
		}

		context.stroke();
		context.restore();
	}

	drawGlyphRiver(frame, configuration, timeSeconds, quality) {
		const text = configuration.text.replace(/\s+/g, '') || DEFAULT_HEBREW;
		const rows = 4 + Math.round(configuration.density * 4 * quality);
		const columns = 10 + Math.round(configuration.density * 13 * quality);
		const speed = 24 + configuration.flow * 52 + frame.bass * 110;
		const context = this.context;
		context.save();
		context.globalCompositeOperation = 'lighter';
		context.textAlign = 'center';
		context.textBaseline = 'middle';

		for (let row = 0; row < rows; row += 1) {
			for (let column = 0; column < columns; column += 1) {
				this.drawGlyph({ context, text, row, column, rows, columns, speed, frame, configuration, timeSeconds });
			}
		}

		context.restore();
	}

	drawGlyph({ context, text, row, column, rows, columns, speed, frame, configuration, timeSeconds }) {
		const seed = column * 0.73 + row * 3.17;
		const travel = (timeSeconds * speed * (0.5 + row / rows) + column * this.width / columns) % (this.width + 100);
		const y = (row + 0.65) / rows * this.height + Math.sin(seed + timeSeconds * 1.8) * (7 + frame.mid * 18);
		const size = 13 + frame.energy * 17 + row / rows * 11 + frame.pulse * 5;
		const glyphIndex = column + row * 7 + Math.floor(timeSeconds * 2);
		context.font = `700 ${size}px Arial, sans-serif`;
		context.shadowBlur = 7 + frame.treble * 20;
		context.shadowColor = colorToCss(configuration.preset.primary, 0.9);
		context.fillStyle = colorToCss(configuration.preset.secondary, 0.28 + frame.energy * 0.55);
		context.fillText(text[glyphIndex % text.length], travel - 50, y);
	}

	drawFallback(frame, configuration, timeSeconds) {
		const gradient = this.context.createRadialGradient(this.width * 0.5, this.height * 0.5, 0, this.width * 0.5, this.height * 0.5, this.width * 0.7);
		gradient.addColorStop(0, colorToCss(configuration.preset.primary, 0.25 + frame.bass * 0.18));
		gradient.addColorStop(1, '#02050d');
		this.context.fillStyle = gradient;
		this.context.fillRect(0, 0, this.width, this.height);
		this.context.fillStyle = colorToCss(configuration.preset.secondary, 0.45);
		for (let index = 0; index < 100; index += 1) {
			const x = (index * 97 + timeSeconds * 45) % this.width;
			const y = (index * 53 + Math.sin(index + timeSeconds) * 30 + this.height) % this.height;
			this.context.fillRect(x, y, 2 + frame.energy * 3, 2 + frame.energy * 3);
		}
	}
}
