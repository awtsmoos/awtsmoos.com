// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioCompositionController.js
 * @description Coordinates visible composition selection, refresh, evaluation, and lifecycle services.
 * The Awtsmoos renews interface and document without parallel authority; Awtsmoos.com lets
 * blank intention and existing nested canvases share one revisioned contract without identity collision.
 */

import { MovieStudioCompositionActions } from './MovieStudioCompositionActions.js';
import { evaluateMovieStudioCompositionSelection } from './MovieStudioCompositionEvaluation.js';
import { MovieStudioCompositionInteraction } from './MovieStudioCompositionInteraction.js';
import { MovieStudioCompositionLifecycle } from './MovieStudioCompositionLifecycle.js';
import { paintMovieStudioCompositionWorkspace } from './MovieStudioCompositionPresenter.js';
import { MovieStudioCompositionSelection } from './MovieStudioCompositionSelection.js';
import { collectMovieStudioCompositionView } from './MovieStudioCompositionView.js';

export class MovieStudioCompositionController {
	constructor(session, root) {
		this.session = session;
		this.view = collectMovieStudioCompositionView(root);
		this.selection = new MovieStudioCompositionSelection();
		this.lifecycle = new MovieStudioCompositionLifecycle(this);
		this.actions = new MovieStudioCompositionActions(this);
		this.interaction = new MovieStudioCompositionInteraction(this);
		this.unsubscribe = session.events?.on?.('project:changed', () => this.refresh());
		this.refresh();
	}

	get api() {
		return this.session.publicApi.compositions;
	}

	get selectedCompositionId() {
		return this.selection.compositionId;
	}

	get selectedLayerId() {
		return this.selection.layerId;
	}

	refresh() {
		if (!this.view.scope) return null;
		const compositions = this.api.list();
		this.selection.reconcile(compositions);
		return paintMovieStudioCompositionWorkspace(
			this.view,
			compositions,
			this.selection.compositionId,
			this.selection.layerId
		);
	}

	beginComposition() {
		return this.lifecycle.beginComposition();
	}

	beginLayer() {
		return this.lifecycle.beginLayer();
	}

	selectComposition(compositionId) {
		this.selection.selectComposition(compositionId);
		return this.refresh();
	}

	selectLayer(layerId) {
		this.selection.selectLayer(layerId);
		return this.refresh();
	}

	runCompositionAction(action) {
		return this.actions.composition(action);
	}

	runLayerAction(action) {
		return this.actions.layer(action);
	}

	evaluate() {
		return evaluateMovieStudioCompositionSelection(this);
	}

	finish(result, compositionId = this.selectedCompositionId, layerId = this.selectedLayerId) {
		return this.lifecycle.finish(result, compositionId, layerId);
	}

	status(message) {
		return this.lifecycle.status(message);
	}

	destroy() {
		this.unsubscribe?.();
		this.interaction.destroy();
	}
}
