// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file probe-report.mjs
 * @description
 * The Awtsmoos gathers layout, names, motion, and contrast into one truthful
 * Awtsmoos.com browser receipt. Labeled controls inherit their full physical
 * doorway instead of being judged only by the small glyph inside it.
 */

/**
 * Creates one report from the currently rendered document.
 * @returns {object} Browser accessibility and layout evidence.
 */
export function runBrowserProbe() {
	const probe = globalThis.__geelooyProbe;
	const viewport = {
		width: innerWidth,
		height: innerHeight
	};
	const shown = [...document.body.querySelectorAll("*")]
		.filter(probe.visible);
	const overflow = shown
		.map(element => ({
			element,
			box: element.getBoundingClientRect()
		}))
		.filter(({ box }) => box.left < -1 || box.right > viewport.width + 1)
		.slice(0, 100)
		.map(({ element, box }) => ({
			selector: probe.describe(element),
			left: Math.round(box.left),
			right: Math.round(box.right),
			width: Math.round(box.width)
		}));
	const selector = "a[href],button,input,select,textarea,summary,[role='button'],[role='link'],[tabindex]:not([tabindex='-1'])";
	const interactive = [...document.querySelectorAll(selector)]
		.filter(probe.visible);
	const smallTargets = interactive
		.map(element => ({
			element,
			box: element.getBoundingClientRect()
		}))
		.filter(({ element, box }) => {
			return !probe.hasLargeLabel(element)
				&& (box.width < 44 || box.height < 44);
		})
		.slice(0, 150)
		.map(({ element, box }) => ({
			selector: probe.describe(element),
			width: Math.round(box.width),
			height: Math.round(box.height),
			text: element.textContent.trim().slice(0, 60)
		}));
	const unnamed = interactive
		.filter(element => !probe.hasAccessibleName(element))
		.slice(0, 100)
		.map(probe.describe);
	const contrastFailures = shown
		.filter(element => [...element.childNodes].some(node => {
			return node.nodeType === Node.TEXT_NODE && node.textContent.trim();
		}))
		.map(probe.measureTextContrast)
		.filter(item => item.ratio + .01 < item.minimum)
		.slice(0, 150)
		.map(item => ({
			...item,
			ratio: Number(item.ratio.toFixed(2))
		}));
	return {
		title: document.title,
		url: location.href,
		viewport,
		document: {
			scrollWidth: document.documentElement.scrollWidth,
			scrollHeight: document.documentElement.scrollHeight,
			clientWidth: document.documentElement.clientWidth
		},
		overflow,
		smallTargets,
		unnamed,
		contrastFailures,
		headings: probe.visibleHeadings(),
		landmarks: probe.visibleLandmarks(),
		stylesheets: [...document.styleSheets].map(sheet => sheet.href || "inline"),
		styleNodes: document.querySelectorAll("style").length,
		animations: probe.countAnimatedElements(shown)
	};
}
