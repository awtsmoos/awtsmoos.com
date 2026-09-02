//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AwtsmoosStudioApp.js
 * @description Mounts the unified Studio from lightweight state, session, action, and agent vessels while deep AI, editor, federation, export, and provider worlds stay lazy.
 * The Awtsmoos unites many creative powers without forcing every hidden chamber through first light;
 * Awtsmoos.com keeps one movie heart alive while deeper instruments awaken only when intention makes them bright.
 */
import {
	AwtsmoosUiRenderer,
	AwtsmoosUiStore
} from '../../../libs/AwtsmoosUI/src/index.js';
import { StudioLazyAgentApi } from './api/StudioLazyAgentApi.js';
import { describeStudioCoreCapabilities } from './api/StudioAgentApiManifest.js';
import { StudioLazyUiActions } from './loading/StudioLazyUiActions.js';
import { StudioMovieSession } from './movie/StudioMovieSession.js';
import { createStudioActions } from './StudioActions.js';
import { createStudioLayout } from './StudioLayout.js';
import { createStudioState } from './StudioState.js';

/** Unified application root whose heavy capability implementations are no longer startup dependencies. */
export class AwtsmoosStudioApp {
	constructor(root) {
		this.root = root;
		this.store = new AwtsmoosUiStore(createStudioState());
		this.session = new StudioMovieSession({
			root,
			store: this.store
		});
		this.agentApi = new StudioLazyAgentApi(this.session);
		this.actions = new StudioLazyUiActions(
			createStudioActions(this.session),
			this.session
		);
		this.renderer = new AwtsmoosUiRenderer({
			root,
			store: this.store,
			actions: this.actions
		});
	}

	/** Mounts visible Studio UI and publishes lightweight capability evidence immediately. */
	mount() {
		this.renderer.mount(createStudioLayout());
		this.session.mount();
		this.publishCoreCapabilities();
		return this;
	}

	/** Publishes truthful first-render capability metadata without importing procedural or provider implementations. */
	publishCoreCapabilities() {
		const capabilities = describeStudioCoreCapabilities();
		this.store.set('capabilities', capabilities);
		this.store.set(
			'status',
			'Core Studio ready · advanced editor, AI, federation, export, and Pro Tools load only when requested.'
		);
		return capabilities;
	}

	/** Preloads the advanced agent island for callers that want full synchronous metadata afterward. */
	async preloadAdvancedCapabilities() {
		const api = await this.agentApi.preloadAdvanced();
		const capabilities = {
			...this.store.get('capabilities', {}),
			renderer: api.capabilities()
		};
		this.store.set('capabilities', capabilities);
		return capabilities;
	}

	/** Releases playback, subscriptions, and rendered UI owned by this app instance. */
	destroy() {
		this.session.destroy();
		this.renderer.destroy();
	}
}
