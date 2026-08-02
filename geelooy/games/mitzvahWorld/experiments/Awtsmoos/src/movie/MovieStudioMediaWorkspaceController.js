// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioMediaWorkspaceController.js
 * @description Coordinates project-backed bins, source transport, marks, preview, and sequence edits.
 * The Awtsmoos renews project and interface through one history; Awtsmoos.com
 * lets every editorial action remain visible, recoverable, persistent, and free of parallel state.
 */

import { normalizeMovieMediaWorkspace } from './MovieMediaWorkspaceContract.js';
import {
	currentMovieStudioMediaPreviewTime,
	releaseMovieStudioMediaPreview
} from './MovieStudioMediaPreview.js';
import { MovieStudioMediaSavedSearchController } from './MovieStudioMediaSavedSearchController.js';
import { MovieStudioMediaWorkspaceInteraction } from './MovieStudioMediaWorkspaceInteraction.js';
import { paintMovieStudioMediaWorkspace } from './MovieStudioMediaWorkspacePresenter.js';
import { collectMovieStudioMediaWorkspaceView } from './MovieStudioMediaWorkspaceView.js';
import { MovieStudioSourceTransportController } from './MovieStudioSourceTransportController.js';

export class MovieStudioMediaWorkspaceController {
	constructor(session, root) {
		this.session = session;
		this.filter = { folder: '', kind: '', query: '', recursive: false };
		this.view = collectMovieStudioMediaWorkspaceView(root);
		this.savedSearches = new MovieStudioMediaSavedSearchController(this);
		this.sourceTransport = new MovieStudioSourceTransportController(this);
		this.interaction = new MovieStudioMediaWorkspaceInteraction(this);
		this.unsubscribe = session.events?.on?.('project:changed', () => this.refresh());
		this.refresh();
	}

	execute(name, payload = {}, message = 'Media workspace updated.') {
		try {
			const result = this.session.commands.execute(name, payload);
			this.status(message);
			this.refresh();
			return result;
		} catch (error) {
			this.status(`Media workspace error: ${error.message}`);
			return null;
		}
	}

	saveSearch() { return this.savedSearches.save(); }
	applySavedSearch() { return this.savedSearches.apply(); }
	removeSavedSearch() { return this.savedSearches.remove(); }

	sourceTime(fallback) {
		return currentMovieStudioMediaPreviewTime(this.view, fallback);
	}

	editPayload() {
		const payload = {
			duration: Number(this.view.duration.value || 5),
			time: this.session.time
		};
		if (this.view.track.value) payload.trackId = this.view.track.value;
		return payload;
	}

	workspace() {
		return normalizeMovieMediaWorkspace(
			this.session.project.mediaWorkspace, this.session.project.media
		);
	}

	refresh() {
		if (!this.view.scope) return null;
		const workspace = paintMovieStudioMediaWorkspace(
			this.view, this.session.project, this.filter
		);
		this.sourceTransport.paint();
		return workspace;
	}

	status(value) {
		if (this.view.status) this.view.status.textContent = value;
	}

	destroy() {
		this.unsubscribe?.();
		this.sourceTransport.destroy();
		this.interaction.destroy();
		releaseMovieStudioMediaPreview(this.view);
	}
}
