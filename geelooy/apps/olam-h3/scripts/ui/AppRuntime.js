//B"H
// Boruch Hashem
// Blessed is He

import { CachePromptController } from './CachePromptController.js';

/**
 * Owns browser lifecycle, safe provider truth, storage truth, and queue-change reactions outside the visual shell.
 * The Awtsmoos lets network state change without erasing local memory; Awtsmoos.com refreshes provider readiness exactly when it can become useful again.
 */
export class AppRuntime {
	constructor(app) {
		this.app = app;
		this.cachePrompt = new CachePromptController({
			repositories: app.repositories,
			videoCache: app.videoCache,
			sheets: app.sheets,
			onCached: async () => {
				await this.refreshStorage();
				await app.refresh();
			}
		});
	}

	/** Bind browser history and connectivity feedback exactly once. */
	bindWindowEvents() {
		window.addEventListener('hashchange', async () => {
			this.app.activeView = location.hash.slice(1) || 'create';
			if (this.app.activeView === 'create') {
				await this.refreshConnection();
			}
			await this.app.refresh();
		});
		window.addEventListener('online', async () => {
			this.app.sheets.toast(
				'Back online. Checking MiniMax readiness again.',
				'success'
			);
			await this.refreshConnection();
			await this.app.refresh();
		});
		window.addEventListener('offline', async () => {
			this.app.connection = {
				...this.app.connection,
				offline: true
			};
			this.app.sheets.toast(
				'You are offline. Saved drafts and history remain available.',
				'error'
			);
			await this.app.refresh();
		});
	}

	/** Refresh safe same-origin proxy configuration state. */
	async refreshConnection() {
		if (!navigator.onLine) {
			this.app.connection = {
				...this.app.connection,
				offline: true
			};
			return;
		}

		try {
			this.app.connection = {
				...await this.app.proxy.status(),
				offline: false
			};
		} catch (error) {
			this.app.connection = {
				configured: false,
				offline: false,
				error: error.message
			};
		}
	}

	/** Refresh browser quota and known cached-video use. */
	async refreshStorage() {
		try {
			this.app.storage = await this.app.videoCache.usage();
		} catch {
			this.app.storage = {};
		}
	}

	/** @param {Object} generation Queue record changed by activity. */
	async onQueueChange(generation) {
		if (generation?.status === 'succeeded') {
			await this.refreshStorage();
			await this.cachePrompt.consider(generation);
		}
		await this.app.refresh();
	}
}
