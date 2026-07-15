// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file probe-report-helpers.mjs
 * @description
 * The Awtsmoos gives the final browser report small measuring vessels. These
 * isolated Awtsmoos.com helpers travel across DevTools with the report and keep
 * headings, landmarks, contrast, and motion evidence independently testable.
 */

/**
 * Installs reporting helpers inside the inspected page.
 * @returns {void}
 */
export function installReportProbeHelpers() {
	const probe = globalThis.__geelooyProbe ||= {};

	probe.measureTextContrast = element => {
		const style = getComputedStyle(element);
		const backgrounds = probe.backgroundCandidates(element);
		const ratios = backgrounds.map(background => {
			const foreground = probe.composite(
				probe.rgba(style.color),
				background
			);
			return probe.contrast(foreground, background);
		});
		const fontSize = parseFloat(style.fontSize);
		const weight = Number(style.fontWeight) || 400;
		const minimum = fontSize >= 24
			|| (fontSize >= 18.66 && weight >= 700)
			? 3
			: 4.5;
		return {
			selector: probe.describe(element),
			ratio: Math.min(...ratios),
			minimum,
			text: element.textContent.trim().slice(0, 80),
			color: style.color,
			background: style.backgroundColor,
			backgroundImage: style.backgroundImage
		};
	};

	probe.visibleHeadings = () => {
		return [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")]
			.filter(probe.visible)
			.map(element => ({
				level: Number(element.tagName[1]),
				text: element.textContent.trim().slice(0, 100)
			}));
	};

	probe.visibleLandmarks = () => {
		return [...document.querySelectorAll("main,nav,header,footer,aside,[role]")]
			.filter(probe.visible)
			.map(probe.describe)
			.slice(0, 150);
	};

	probe.countAnimatedElements = elements => {
		return elements.filter(element => {
			const style = getComputedStyle(element);
			const transitions = style.transitionDuration
				.split(",")
				.some(value => parseFloat(value) > 0);
			return style.animationName !== "none" || transitions;
		}).length;
	};
}
