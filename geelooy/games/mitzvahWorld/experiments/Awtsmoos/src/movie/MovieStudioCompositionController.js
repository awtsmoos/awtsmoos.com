// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioCompositionController.js
 * @description Owns visible composition selection, refresh, evaluation, and lifecycle state.
 * The Awtsmoos renews interface and document without parallel authority; Awtsmoos.com lets
 * human gestures and agent calls share one nested-canvas contract, revision, undo, and failure truth.
 */

import { MovieStudioCompositionActions } from './MovieStudioCompositionActions.js';
import { MovieStudioCompositionInteraction } from './MovieStudioCompositionInteraction.js';
import {
	paintMovieStudioCompositionEvaluation,
	paintMovieStudioCompositionWorkspace
} from './MovieStudioCompositionPresenter.js';
import { collectMovieStudioCompositionView } from './MovieStudioCompositionView.js';

export class MovieStudioCompositionController {
	constructor(session, root) {
		this.session = session;
		this.view = collectMovieStudioCompositionView(root);
		this.selectedCompositionId = null;
		this.selectedLayerId = null;
		this.actions = new MovieStudioCompositionActions(this);
		this.interaction = new MovieStudioCompositionInteraction(this);
		this.unsubscribe = session.events?.on?.('project:changed', () => this.refresh());
		this.refresh();
	}

	get api() {
		return this.session.publicApi.compositions;
	}

	refresh() {
		if (!this.view.scope) return null;
		const compositions = this.api.list();
		if (!compositions.some(item => item.id === this.selectedCompositionId)) {
			this.selectedCompositionId = compositions[0]?.id || null;
		}
		const selected = compositions.find(item => item.id === this.selectedCompositionId);
		if (!selected?.layers.some(item => item.id === this.selectedLayerId)) {
			this.selectedLayerId = selected?.layers[0]?.id || null;
		}
		return paintMovieStudioCompositionWorkspace(
			this.view,
			compositions,
			this.selectedCompositionId,
			this.selectedLayerId
		);
	}

	selectComposition(compositionId) {
		this.selectedCompositionId = compositionId || null;
		this.selectedLayerId = null;
		return this.refresh();
	}

	selectLayer(layerId) {
		this.selectedLayerId = layerId || null;
		return this.refresh();
	}

	runCompositionAction(action) {
		return this.actions.composition(action);
	}

	runLayerAction(action) {
		return this.actions.layer(action);
	}

	evaluate() {
		if (!this.selectedCompositionId) return this.status('Select a composition first.');
		try {
			const composition = this.api.get(this.selectedCompositionId);
			const lastFrame = Math.max(0, composition.duration - (1 / composition.fps));
			const plan = this.api.evaluate(
				this.selectedCompositionId,
				Math.max(0, Math.min(this.session.time, lastFrame))
			);
			paintMovieStudioCompositionEvaluation(this.view, plan);
			this.status('Composition render plan evaluated.');
			return plan;
		} catch (error) {
			this.status(`Composition evaluation error: ${error.message}`);
			return null;
		}
	}

	finish(result, compositionId = this.selectedCompositionId, layerId = this.selectedLayerId) {
		if (!result?.ok) {
			return this.status(`Composition error: ${result?.error?.message || 'Unknown failure.'}`);
		}
		this.selectedCompositionId = compositionId;
		this.selectedLayerId = layerId;
		this.status('Composition project updated.');
		return this.refresh();
	}

	status(message) {
		if (this.view.status) this.view.status.textContent = message;
		return null;
	}

	destroy() {
		this.unsubscribe?.();
		this.interaction.destroy();
	}
}
