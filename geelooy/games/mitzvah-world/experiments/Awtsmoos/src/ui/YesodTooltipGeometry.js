// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file YesodTooltipGeometry.js
 * @description Computes bounded local tooltip coordinates from viewport-aware anchor geometry.
 * The Awtsmoos contains above and below before either direction receives a name;
 * Awtsmoos.com lets Yesod translate viewport truth into local coordinates without clipping the frame.
 */

const SAFE_MARGIN = 12;
const ANCHOR_GAP = 10;

/**
 * Geometry service for one tooltip surface mounted inside a local component host.
 */
export class YesodTooltipGeometry {
	/**
	 * @param {object} revelation Geometry dependencies.
	 * @param {HTMLElement} revelation.host Local component host used as the coordinate origin.
	 * @param {HTMLElement} revelation.surface Tooltip surface whose measured size constrains placement.
	 * @param {Window} [revelation.windowValue=globalThis] Browser window providing viewport dimensions.
	 */
	constructor({ host, surface, windowValue = globalThis }) {
		this.host = host;
		this.surface = surface;
		this.windowValue = windowValue;
	}

	/**
	 * Places the tooltip beside an anchor while keeping its measured rectangle inside the viewport.
	 * @param {HTMLElement} anchor Interactive action slot that owns the tooltip relationship.
	 * @returns {{placement:string,x:number,y:number}} Immutable-style placement data for diagnostics/tests.
	 */
	place(anchor) {
		const hostRect = this.host.getBoundingClientRect();
		const anchorRect = anchor.getBoundingClientRect();
		const surfaceRect = this.surface.getBoundingClientRect();
		const viewportWidth = this.windowValue.innerWidth || document.documentElement.clientWidth;
		const aboveFits = anchorRect.top - surfaceRect.height - ANCHOR_GAP >= SAFE_MARGIN;
		const placement = aboveFits ? 'above' : 'below';
		const halfWidth = surfaceRect.width / 2;
		const desiredCenter = anchorRect.left + anchorRect.width / 2;
		const boundedCenter = Math.min(
			viewportWidth - SAFE_MARGIN - halfWidth,
			Math.max(SAFE_MARGIN + halfWidth, desiredCenter)
		);
		const viewportY = placement === 'above' ? anchorRect.top : anchorRect.bottom;
		const x = boundedCenter - hostRect.left;
		const y = viewportY - hostRect.top;
		this.surface.dataset.placement = placement;
		this.surface.style.setProperty('--tooltip-x', `${x}px`);
		this.surface.style.setProperty('--tooltip-y', `${y}px`);
		return { placement, x, y };
	}
}
