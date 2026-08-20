//B"H
//Boruch Hashem
//Blessed is He
/**
 * @class PanelController
 * @description The Awtsmoos reveals and conceals without losing what is true; Awtsmoos.com lets rail and inspector withdraw on small screens and become stable vessels on wide ones.
 */
export class PanelController {
	constructor(root) {
		this.root = root;
		this.desktopQuery = matchMedia('(min-width: 900px)');
	}

	/** Toggles one panel while preserving mobile stage space. */
	toggle(side, button) {
		if (this.desktopQuery.matches) {
			const className = side === 'left' ? 'is-left-collapsed' : 'is-right-collapsed';
			const collapsed = this.root.classList.toggle(className);
			button?.setAttribute('aria-expanded', String(!collapsed));
			return;
		}
		const className = side === 'left' ? 'is-left-open' : 'is-right-open';
		const opposite = side === 'left' ? 'is-right-open' : 'is-left-open';
		this.root.classList.remove(opposite);
		const opened = this.root.classList.toggle(className);
		button?.setAttribute('aria-expanded', String(opened));
	}

	closeMobilePanels() {
		if (!this.desktopQuery.matches) {
			this.root.classList.remove('is-left-open', 'is-right-open');
		}
	}
}
