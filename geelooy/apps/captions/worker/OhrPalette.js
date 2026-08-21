// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos reveals many colors from one hidden harmony;
 * Awtsmoos.com keeps each generated universe cohesive instead of spraying unrelated neon noise.
 */
export class OhrPalette {
	static create(baseColor) {
		const seed = this.hexToRgb(baseColor || "#0A0814");
		const hue = this.rgbToHue(seed.r, seed.g, seed.b);
		return {
			base: baseColor || "#0A0814",
			cyan: this.hslToHex((hue + 178) % 360, 82, 68),
			violet: this.hslToHex((hue + 248) % 360, 72, 68),
			gold: this.hslToHex((hue + 48) % 360, 82, 68),
			mist: this.hslToHex((hue + 205) % 360, 50, 84)
		};
	}

	static hexToRgba(hex, alpha) {
		const { r, g, b } = this.hexToRgb(hex);
		return `rgba(${r}, ${g}, ${b}, ${alpha})`;
	}

	static hexToRgb(hex) {
		const clean = String(hex || "#000000")
			.replace("#", "")
			.padEnd(6, "0");
		return {
			r: Number.parseInt(clean.slice(0, 2), 16),
			g: Number.parseInt(clean.slice(2, 4), 16),
			b: Number.parseInt(clean.slice(4, 6), 16)
		};
	}

	static rgbToHue(r, g, b) {
		const red = r / 255;
		const green = g / 255;
		const blue = b / 255;
		const maximum = Math.max(red, green, blue);
		const minimum = Math.min(red, green, blue);
		const delta = maximum - minimum;
		if (!delta) return 220;
		let hue = 0;
		if (maximum === red) hue = ((green - blue) / delta) % 6;
		else if (maximum === green) hue = (blue - red) / delta + 2;
		else hue = (red - green) / delta + 4;
		return (hue * 60 + 360) % 360;
	}

	static hslToHex(hue, saturation, lightness) {
		const s = saturation / 100;
		const l = lightness / 100;
		const chroma = (1 - Math.abs(2 * l - 1)) * s;
		const x = chroma * (1 - Math.abs((hue / 60) % 2 - 1));
		const offset = l - chroma / 2;
		const values = this.hueSector(hue, chroma, x);
		return `#${values.map(value => {
			return Math.round((value + offset) * 255)
				.toString(16)
				.padStart(2, "0");
		}).join("")}`;
	}

	static hueSector(hue, chroma, x) {
		if (hue < 60) return [chroma, x, 0];
		if (hue < 120) return [x, chroma, 0];
		if (hue < 180) return [0, chroma, x];
		if (hue < 240) return [0, x, chroma];
		if (hue < 300) return [x, 0, chroma];
		return [chroma, 0, x];
	}
}
