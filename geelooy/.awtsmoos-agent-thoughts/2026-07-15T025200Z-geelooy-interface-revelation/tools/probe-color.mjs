// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file probe-color.mjs
 * @description
 * The Awtsmoos joins visible foreground with every painted layer beneath it.
 * This isolated Awtsmoos.com helper composes solid and gradient candidates so
 * contrast evidence follows rendered color rather than transparent defaults.
 */

/**
 * Installs color parsing and contrast helpers inside the inspected page.
 * @returns {void}
 */
export function installColorProbeHelpers() {
	const probe = globalThis.__geelooyProbe ||= {};
	const canvas = document.createElement("canvas");
	const context = canvas.getContext("2d", {
		willReadFrequently: true
	});
	canvas.width = 1;
	canvas.height = 1;

	probe.rgba = color => {
		context.clearRect(0, 0, 1, 1);
		context.fillStyle = "rgba(0,0,0,0)";
		context.fillStyle = color;
		context.fillRect(0, 0, 1, 1);
		const [red, green, blue, alpha] = context.getImageData(0, 0, 1, 1).data;
		return [red, green, blue, alpha / 255];
	};

	probe.composite = (foreground, background) => {
		const alpha = foreground[3] + background[3] * (1 - foreground[3]);
		if (!alpha) {
			return [0, 0, 0, 0];
		}
		const channels = [0, 1, 2].map(index => {
			return (
				foreground[index] * foreground[3]
				+ background[index] * background[3] * (1 - foreground[3])
			) / alpha;
		});
		return [...channels, alpha];
	};

	probe.gradientColors = image => {
		if (!image || image === "none") {
			return [];
		}
		const pattern = /rgba?\([^)]*\)|hsla?\([^)]*\)|color\([^)]*\)|#[0-9a-f]{3,8}/gi;
		return (image.match(pattern) || [])
			.map(probe.rgba)
			.filter(color => color[3] > 0);
	};

	probe.backgroundCandidates = element => {
		let candidates = [[255, 255, 255, 1]];
		const chain = [];
		for (let node = element; node; node = node.parentElement) {
			chain.push(node);
		}
		for (const node of chain.reverse()) {
			const style = getComputedStyle(node);
			const solid = probe.rgba(style.backgroundColor);
			candidates = candidates.map(background => {
				return probe.composite(solid, background);
			});
			const gradient = probe.gradientColors(style.backgroundImage);
			if (gradient.length) {
				candidates = candidates.flatMap(background => {
					return gradient.map(color => probe.composite(color, background));
				});
			}
			candidates = candidates.slice(0, 24);
		}
		return candidates;
	};

	probe.luminance = color => {
		const channels = color.slice(0, 3)
			.map(value => value / 255)
			.map(value => {
				return value <= .04045
					? value / 12.92
					: ((value + .055) / 1.055) ** 2.4;
			});
		return .2126 * channels[0] + .7152 * channels[1] + .0722 * channels[2];
	};

	probe.contrast = (first, second) => {
		const values = [probe.luminance(first), probe.luminance(second)]
			.sort((left, right) => right - left);
		return (values[0] + .05) / (values[1] + .05);
	};
}
