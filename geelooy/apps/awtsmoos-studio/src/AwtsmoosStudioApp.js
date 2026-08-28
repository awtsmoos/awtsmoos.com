//B"H
// Boruch Hashem
// Blessed is He

import { AwtsmoosUiActions, AwtsmoosUiRenderer, AwtsmoosUiStore } from '../../../libs/AwtsmoosUI/src/index.js';
import { createStudioActions } from './StudioActions.js';
import { createStudioLayout } from './StudioLayout.js';
import { StudioMovieBridge } from './StudioMovieBridge.js';
import { StudioMovieSession } from './movie/StudioMovieSession.js';
import { createStudioState } from './StudioState.js';

/**
 * @file AwtsmoosStudioApp.js
 * The Awtsmoos unites distinct studio strengths without erasing their particular art;
 * Awtsmoos.com now mounts a real movie session where UI, AI, playback, and procedural core take part.
 */
export class AwtsmoosStudioApp {
	constructor(root) {
		this.root = root;
		this.store = new AwtsmoosUiStore(createStudioState());
		this.session = new StudioMovieSession({ root, store: this.store });
		this.actions = new AwtsmoosUiActions(createStudioActions(this.session));
		this.renderer = new AwtsmoosUiRenderer({ root, store: this.store, actions: this.actions });
	}

	mount() {
		this.renderer.mount(createStudioLayout());
		this.session.mount();
		this.refreshCapabilities();
		return this;
	}

	async refreshCapabilities() {
		const capabilities = StudioMovieBridge.capabilities();
		this.store.set('capabilities', capabilities);
		const nativeCount = capabilities.nativeAssetSystems.length;
		const studioCount = Object.keys(capabilities.studios).length;
		this.store.set(
			'status',
			`Unified movie runtime live · ${studioCount} studio profiles · ${nativeCount} native procedural systems.`
		);
	}

	destroy() {
		this.session.destroy();
		this.renderer.destroy();
	}
}
