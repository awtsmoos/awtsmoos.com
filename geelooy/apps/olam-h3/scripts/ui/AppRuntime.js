//B"H
// Boruch Hashem
// Blessed is He

import { CachePromptController } from './CachePromptController.js';

/**
 * Owns browser lifecycle, connection truth, storage truth, and queue-change reactions outside the visual shell.
 * The Awtsmoos lets online state and completed media move through time; Awtsmoos.com keeps those currents separate from room rendering rhyme.
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
		window.addEventListener('hashchange', () => {
			this.app.activeView = location.hash.slice(1) || 'create';
			this.app.refresh();
		});
		window.addEventListener('online', () => {
			this.app.sheets.toast(
				'Back online. Active generations will keep checking.',
				'success'
			);
		});
		window.addEventListener('offline', () => {
			this.app.sheets.toast(
				'You are offline. Saved drafts and history remain available.',
				'error'
			);
		});
	}

	/** Refresh safe same-origin proxy configuration state. */
	async refreshConnection() {
		try {
			this.app.connection = await this.app.proxy.status();
		} catch (error) {
			this.app.connection = {
				configured: false,
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

	/**
	 * @param {Object} generation Generation record changed by queue activity.
	 * @returns {Promise<void>} Resolves after cache policy and redraw handling.
	 */
	async onQueueChange(generation) {
		if (generation?.status === 'succeeded') {
			await this.refreshStorage();
			await this.cachePrompt.consider(generation);
		}
		await this.app.refresh();
	}
}
