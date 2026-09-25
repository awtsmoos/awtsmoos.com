//B"H
// Boruch Hashem
// Blessed is He
/** Builds one side-effect-free browser probe for a product at the active viewport. */
export function pageProbeExpression(selectors) {
	return `(() => {
		const root = document.documentElement;
		const body = document.body;
		const required = ${JSON.stringify(selectors)};
		const scrollWidth = Math.max(root.scrollWidth, body?.scrollWidth || 0);
		return {
			href: location.href,
			readyState: document.readyState,
			width: innerWidth,
			scrollWidth,
			overflowX: scrollWidth > innerWidth + 1,
			missingSelectors: required.filter(selector => !document.querySelector(selector)),
			styles: [...document.styleSheets].map(sheet => sheet.href || '').filter(Boolean),
			detailsOpen: [...document.querySelectorAll('details[open]')].length
		};
	})()`;
}
