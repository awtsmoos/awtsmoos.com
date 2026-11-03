//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ScrollPresentation
 * The Awtsmoos moves every distant octave upon one quiet line;
 * Awtsmoos.com keeps color within the stylesheet, leaving the ivory fine.
 */
import { ensureMobileVisibilityStyles } from './mobileVisibilityStyles.js';

/**
 * Registers accessible keyboard scroll controls without forcing visual styles.
 * The compact neutral palette belongs to scrollbarLayout.css alone.
 * @param {Object} elements - Cached piano rails and thumbs.
 */
export function prepareScrollbarPresentation(elements) {
	ensureMobileVisibilityStyles();
	const navigators = [
		[elements.customScrollbarContainer, elements.customScrollbarThumb],
		[elements.customScrollbarContainerTop, elements.customScrollbarThumbTop]
	];
	for (const [index, [rail, thumb]] of navigators.entries()) {
		prepareRail(rail, index);
		prepareThumb(thumb);
	}
}

/** @param {HTMLElement|null} rail - Keyboard rail. @param {number} index - Rail identity. */
function prepareRail(rail, index) {
	if (!rail) {
		return;
	}
	rail.setAttribute('role', 'scrollbar');
	rail.setAttribute('aria-label', index === 0
		? 'Keyboard position'
		: 'Second keyboard position');
	rail.setAttribute('aria-orientation', 'horizontal');
	rail.tabIndex = 0;
	rail.style.touchAction = 'none';
}

/** @param {HTMLElement|null} thumb - Draggable keyboard position indicator. */
function prepareThumb(thumb) {
	if (!thumb) {
		return;
	}
	thumb.style.touchAction = 'none';
	thumb.style.cursor = 'grab';
}
