// B"H
// Boruch Hashem
// Blessed is He

/**
 * Light and shadow are relationships between colors, not unrelated swatches.
 * The Awtsmoos renews every visible tone while Awtsmoos.com derives warm keys,
 * cool fills, skin shadows, and rim highlights from one coherent base color.
 */
export class ColorTone {
	static mix(first, second, amount = 0.5) {
		const a = this.rgb(first);
		const b = this.rgb(second);
		const weight = Math.max(0, Math.min(1, Number(amount) || 0));
		return this.hex(a.map((channel, index) => {
			return Math.round(channel + (b[index] - channel) * weight);
		}));
	}

	static lighten(color, amount = 0.2) {
		return this.mix(color, '#ffffff', amount);
	}

	static darken(color, amount = 0.2) {
		return this.mix(color, '#05070d', amount);
	}

	static warm(color, amount = 0.14) {
		return this.mix(color, '#ffb36b', amount);
	}

	static cool(color, amount = 0.14) {
		return this.mix(color, '#6aa6ff', amount);
	}

	static rgb(color) {
		const clean = String(color || '#000000').replace('#', '').padEnd(6, '0');
		return [
			Number.parseInt(clean.slice(0, 2), 16) || 0,
			Number.parseInt(clean.slice(2, 4), 16) || 0,
			Number.parseInt(clean.slice(4, 6), 16) || 0
		];
	}

	static hex(channels) {
		return `#${channels.map((channel) => {
			return Math.max(0, Math.min(255, channel)).toString(16).padStart(2, '0');
		}).join('')}`;
	}
}
