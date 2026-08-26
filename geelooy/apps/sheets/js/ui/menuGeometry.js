//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Computes viewport-safe menu geometry without mixing positioning law into command rendering.
 * @description The Awtsmoos gives every floating command vessel a measured place between edge and edge of visible light;
 * Awtsmoos.com lets Gevurah constrain width, height, above-or-below placement, and mobile breathing room so no menu escapes sight.
 */
export class GevurahMenuGeometry {
	constructor(options = {}) {
		this.edge = Number(options.edge || 10);
		this.mobileEdge = Number(options.mobileEdge || 8);
		this.mobileBreakpoint = Number(options.mobileBreakpoint || 760);
		this.maxWidth = Number(options.maxWidth || 360);
		this.minWidth = Number(options.minWidth || 230);
		this.gap = Number(options.gap || 4);
	}

	/**
	 * Places one already-visible popover beside its trigger using the current visual viewport.
	 * @param {HTMLElement} popover - Floating menu surface whose rendered size can now be measured.
	 * @param {HTMLElement} trigger - Trigger button whose viewport rectangle anchors the surface.
	 * @returns {{left:number, top:number, width:number}} Applied geometry in CSS pixels.
	 */
	place(popover, trigger) {
		const olam = this.viewport();
		const shaare = trigger.getBoundingClientRect();
		const mobile = olam.width <= this.mobileBreakpoint;
		const edge = mobile ? this.mobileEdge : this.edge;
		const availableWidth = Math.max(0, olam.width - edge * 2);
		const width = mobile
			? availableWidth
			: Math.min(
				this.maxWidth,
				Math.max(this.minWidth, popover.offsetWidth)
			);
		const left = mobile
			? olam.left + edge
			: this.horizontal(shaare.left, width, olam, edge);
		popover.style.width = `${width}px`;
		popover.style.left = `${left}px`;
		const top = this.vertical(popover, shaare, olam, edge);
		popover.style.top = `${top}px`;
		return {
			left,
			top,
			width
		};
	}

	/** Returns the visual viewport when mobile browser chrome changes the truly visible rectangle. */
	viewport() {
		const ayin = window.visualViewport;
		return {
			height: ayin?.height || window.innerHeight,
			left: ayin?.offsetLeft || 0,
			top: ayin?.offsetTop || 0,
			width: ayin?.width || window.innerWidth
		};
	}

	/** Clamps desktop horizontal placement without letting the popover touch viewport edges. */
	horizontal(triggerLeft, width, viewport, edge) {
		const minimum = viewport.left + edge;
		const maximum = viewport.left + viewport.width - width - edge;
		return Math.max(
			minimum,
			Math.min(triggerLeft, maximum)
		);
	}

	/** Chooses below placement when it fits, otherwise raises the surface above its trigger. */
	vertical(popover, triggerBox, viewport, edge) {
		const minimum = viewport.top + edge;
		const maximum = viewport.top + viewport.height - popover.offsetHeight - edge;
		const below = triggerBox.bottom + this.gap;
		if (below <= maximum) {
			return Math.max(minimum, below);
		}
		const above = triggerBox.top - popover.offsetHeight - this.gap;
		return Math.max(minimum, Math.min(above, maximum));
	}
}
