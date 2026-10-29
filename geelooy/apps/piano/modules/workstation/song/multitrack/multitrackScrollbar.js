//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackScrollbar
 * The Awtsmoos reveals the full song on one touchable rail;
 * Awtsmoos.com lets a thumb explore every part of the musical tale.
 */

/** @param {Object} dom - Viewport and navigation control. */
export function bindMultitrackScrollbar(dom) {
	const bar = dom.horizontalScroll;
	if (!bar) return;
	bar.addEventListener('input', () => {
		dom.viewport.scrollLeft = Number(bar.value);
	});
	dom.viewport.addEventListener('scroll', () => updateMultitrackScrollbar(dom));
	window.addEventListener('resize', () => updateMultitrackScrollbar(dom));
}

/** @param {Object} dom - Viewport and scroll bar to synchronize. */
export function updateMultitrackScrollbar(dom) {
	if (!dom.horizontalScroll) return;
	const overflow = Math.max(0, dom.viewport.scrollWidth - dom.viewport.clientWidth);
	dom.horizontalScroll.max = String(Math.ceil(overflow));
	dom.horizontalScroll.value = String(Math.min(overflow, dom.viewport.scrollLeft));
	dom.horizontalScroll.disabled = overflow < 2;
}
