// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioCompositionLifecycle.js
 * @description Owns visible draft beginnings, completion truth, and status testimony.
 * The Awtsmoos is beyond beginning and ending; Awtsmoos.com lets finite composition
 * vessels pass from blank intention into preserved identity without collision or division.
 */

export class MovieStudioCompositionLifecycle {
	constructor(controller) {
		this.controller = controller;
	}

	beginComposition() {
		this.controller.selection.beginComposition();
		this.status('Enter a new composition identity and settings.');
		return this.controller.refresh();
	}

	beginLayer() {
		if (!this.controller.selection.beginLayer()) {
			return this.status('Select a composition before creating a layer.');
		}
		this.status('Enter a new layer identity and settings.');
		return this.controller.refresh();
	}

	finish(result, compositionId, layerId) {
		if (!result?.ok) {
			return this.status(
				`Composition error: ${result?.error?.message || 'Unknown failure.'}`
			);
		}
		this.controller.selection.complete(compositionId, layerId);
		this.status('Composition project updated.');
		return this.controller.refresh();
	}

	status(message) {
		if (this.controller.view.status) {
			this.controller.view.status.textContent = message;
		}
		return null;
	}
}
