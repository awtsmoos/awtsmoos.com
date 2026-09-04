//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file IntentNavigationActions.js
 * @description Coordinates intent-to-workspace transitions while awaiting only the lazy chamber explicitly requested by the maker.
 * The Awtsmoos lets intention choose the next vessel while Canvas remains the stable light below;
 * Awtsmoos.com opens Timeline or professional Stage depth through one cached gate, never waking unrelated worlds in tow.
 */

/** Coordinates transient navigation actions used by the Stage-first intent shell. */
export class IntentNavigationActions {
	constructor({ dom, navigator, closeSheet, workstation } = {}) {
		this.dom = dom;
		this.navigator = navigator;
		this.closeSheet = closeSheet;
		this.workstation = workstation;
	}

	/** Opens the lazy Timeline workspace and returns its readiness promise. */
	async openTimeline() {
		this.closeSheet?.(false);
		return this.navigator.openPage('nle');
	}

	/** Reveals professional Stage depth and loads its tools only after returning to Canvas. */
	async openWorkstation() {
		this.closeSheet?.(false);
		await this.navigator.openCanvas();
		this.workstation.open();

		try {
			await this.navigator.loadFeature('stage-workstation');
		} catch (error) {
			console.warn('Stage Workstation could not load.', error);
		}
	}

	/** Closes compact professional depth and optionally returns focus to its Inspect trigger. */
	closeWorkstation(returnFocus = false) {
		this.workstation.close();

		if (returnFocus) {
			this.dom.stageInspectSelection?.focus?.({
				preventScroll: true
			});
		}
	}

	/** Keeps responsive workstation disclosure aligned when navigation leaves the Stage page. */
	handlePageChange(page) {
		if (page !== 'stage') {
			this.workstation.close();
		}
	}
}
