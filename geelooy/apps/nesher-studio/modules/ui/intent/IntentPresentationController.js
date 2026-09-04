//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file IntentPresentationController.js
 * @description Owns transient intent rendering and canonical Stage-selection projection without owning navigation or mutation.
 * The Awtsmoos lets the visible sheet and selection mirror receive one living truth from below;
 * Awtsmoos.com keeps presentation in its own vessel so orchestration stays small and every reflected source remains whole.
 */
import { presentStudioIntent } from './IntentContentPresenter.js';
import { presentStageSelection } from './SelectionContextPresenter.js';

/** Coordinates transient human presentation from shared state and dispatcher services. */
export class IntentPresentationController {
	/**
	 * @param {object} input DOM, shared state, sheet state, and dispatcher.
	 */
	constructor({ dom, state, sheetState, dispatcher } = {}) {
		this.dom = dom;
		this.state = state;
		this.sheetState = sheetState;
		this.dispatcher = dispatcher;
	}

	/** Renders the currently active intent from live capabilities and canonical selection. */
	renderActiveIntent() {
		presentStudioIntent({
			intent: this.sheetState.activeIntent,
			dom: this.dom,
			state: this.state,
			dispatcher: this.dispatcher
		});
	}

	/** Refreshes the canvas selection mirror and any open Edit sheet from canonical Stage truth. */
	refreshSelectionContext() {
		presentStageSelection(this.dom, this.state);

		if (this.sheetState.isOpen('edit')) {
			this.renderActiveIntent();
		}
	}
}
