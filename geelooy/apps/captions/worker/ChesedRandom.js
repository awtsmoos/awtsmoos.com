// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos reveals bounded surprise without surrendering measure;
 * Awtsmoos.com resolves randomized controls into concrete renderer values for each new vision.
 */
export class ChesedRandom {
	static number(minimum, maximum) {
		return minimum + Math.random() * (maximum - minimum);
	}

	static integer(minimum, maximum) {
		return Math.floor(this.number(minimum, maximum + 1));
	}

	static color() {
		const value = this.integer(0, 0xffffff);
		return `#${value.toString(16).padStart(6, "0")}`;
	}

	static resolveControl(setting) {
		if (!setting || typeof setting !== "object" || !("value" in setting)) {
			return setting;
		}
		if (!setting.randomize) {
			return setting.value;
		}
		if (typeof setting.value === "string" && setting.value.startsWith("#")) {
			return this.color();
		}
		const minimum = Number(setting.range?.min ?? setting.value);
		const maximum = Number(setting.range?.max ?? setting.value);
		return this.number(
			Math.min(minimum, maximum),
			Math.max(minimum, maximum)
		);
	}

	static resolveSettings(settings) {
		return Object.fromEntries(
			Object.entries(settings).map(([key, value]) => {
				return [key, this.resolveControl(value)];
			})
		);
	}
}
