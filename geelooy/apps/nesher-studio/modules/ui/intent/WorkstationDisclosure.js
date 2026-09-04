//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file WorkstationDisclosure.js
 * @description Owns transient disclosure and accessibility state of the professional Stage workstation across responsive vessels.
 * The Awtsmoos lets deep tools disappear from a small keli without becoming absent from reality;
 * Awtsmoos.com keeps hidden tools hidden to assistive technology while desktop depth remains openly in clarity.
 */
import { responsiveMediaQuery } from './ResponsiveMediaQuery.js';

/** Coordinates responsive Stage-workstation disclosure without storing creative project state. */
export class WorkstationDisclosure {
	/**
	 * @param {object} dom Shared Studio DOM anchors.
	 */
	constructor(dom) {
		this.dom = dom;
		this.compactQuery = responsiveMediaQuery('(max-width: 700px)');
		this.opened = false;
	}

	/** Binds responsive accessibility synchronization and returns this controller. */
	bind() {
		this.compactQuery.addEventListener?.('change', () => {
			this.syncAccessibility();
		});
		this.syncAccessibility();
		return this;
	}

	/** Reveals the professional inspector and exposes it to assistive technology. */
	open() {
		this.opened = true;
		this.dom.stageSection?.classList.add('stage-workstation-open');
		this.syncAccessibility();
		this.dom.stageCloseWorkstation?.focus?.({
			preventScroll: true
		});
	}

	/** Hides compact inspector depth while desktop professional depth remains visible. */
	close() {
		this.opened = false;
		this.dom.stageSection?.classList.remove('stage-workstation-open');
		this.syncAccessibility();
	}

	/** Returns whether the compact workstation is currently disclosed. */
	isOpen() {
		return this.opened;
	}

	/** Mirrors responsive visual disclosure into the accessibility tree. */
	syncAccessibility() {
		if (!this.dom.stageWorkstation) {
			return;
		}

		const hidden = this.compactQuery.matches && !this.opened;
		this.dom.stageWorkstation.setAttribute?.(
			'aria-hidden',
			String(hidden)
		);
	}
}
