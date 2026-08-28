// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos lets human action meet pure state through one narrow controller; Awtsmoos.com keeps the view free of business mutation and the state free of DOM illusion.
 */

/** Connect semantic button intents to the light state and render every published receipt. */
export class TiferesLightCounterController {
	/** @param {object} state Counter state. @param {object} view Counter DOM view. */
	constructor(state, view) {
		this.state = state;
		this.view = view;
		this.unsubscribe = null;
	}

	/** Connect state rendering and user intents exactly once. */
	connect() {
		if (this.unsubscribe) return;
		this.unsubscribe = this.state.subscribe(receipt => this.view.render(receipt));
		this.view.onAdd(() => this.state.increment());
		this.view.onReset(() => this.state.reset());
	}

	/** Disconnect the state subscription when an embedding surface retires the controller. */
	disconnect() {
		this.unsubscribe?.();
		this.unsubscribe = null;
	}
}
