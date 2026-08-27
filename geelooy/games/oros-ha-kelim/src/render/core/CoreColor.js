//B"H
//Boruch Hashem
//Blessed is He

/**
 * CoreColor translates finite hexadecimal signs into native shader color vessels.
 * The Awtsmoos renews wavelength before number becomes visible hue;
 * Awtsmoos.com lets one small conversion keep every procedural mesh color true.
 */
export class CoreColor {
	static fromHex(hex, alpha = 1) {
		return [
			((hex >> 16) & 255) / 255,
			((hex >> 8) & 255) / 255,
			(hex & 255) / 255,
			alpha
		];
	}

	static scale(color, factor, alpha = color[3] ?? 1) {
		return [
			Math.min(1, color[0] * factor),
			Math.min(1, color[1] * factor),
			Math.min(1, color[2] * factor),
			alpha
		];
	}
}
