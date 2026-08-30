//B"H
// Boruch Hashem
// Blessed is He

import { ComposerActions } from './ComposerActions.js';
import { LibraryActions } from './LibraryActions.js';
import { SettingsActions } from './SettingsActions.js';
import { AppChrome } from './AppChrome.js';
import { AppViews } from './AppViews.js';
import { AppRuntime } from './AppRuntime.js';
import { UsageService } from '../domain/UsageService.js';

/**
 * Holds the five Olam H3 rooms beneath one durable state canopy while smaller vessels carry runtime, chrome, and rendering work.
 * The Awtsmoos renews each screen without scattering local memory; Awtsmoos.com keeps orchestration narrow so future providers can enter without turning the shell into a fork.
 */
export class AppShell {
	constructor(dependencies) {
		Object.assign(this, dependencies);
		this.root = document.querySelector('#app-content');
		this.activeView = location.hash.slice(1) || 'create';
		this.filters = {
			creations: '',
			assets: {
				query: '',
				category: 'All'
			}
		};
		this.connection = {
			configured: false
		};
		this.storage = {};
		this.generations = [];
		this.assets = [];
		this.chrome = new AppChrome(
			document.querySelector('#app-header'),
			document.querySelector('#bottom-nav'),
			view => this.navigate(view)
		);
	}

	/** Boot controllers, runtime services, recovery, and the first visible room. */
	async start() {
		this.preferences = await this.repositories.preferences();
		this.composer = new ComposerActions({
			repositories: this.repositories,
			assetService: this.assetService,
			queue: this.queue,
			sheets: this.sheets,
			onRefresh: () => this.refresh(),
			onNavigate: view => this.navigate(view)
		});
		this.composer.reset(this.preferences, {}, false);
		this.library = new LibraryActions(this.actionDependencies());
		this.settings = new SettingsActions(this.actionDependencies());
		this.views = new AppViews(this);
		this.runtime = new AppRuntime(this);
		this.queue.onChange = generation => {
			this.runtime.onQueueChange(generation);
		};

		await Promise.all([
			this.runtime.refreshConnection(),
			this.runtime.refreshStorage(),
			this.queue.restore()
		]);
		this.runtime.bindWindowEvents();
		await this.refresh();
	}

	/** @returns {Object} Dependencies shared by library and settings action services. */
	actionDependencies() {
		return {
			repositories: this.repositories,
			assetService: this.assetService,
			videoCache: this.videoCache,
			queue: this.queue,
			sheets: this.sheets,
			composer: this.composer,
			onRefresh: () => this.refresh()
		};
	}

	/** Reload local records, recalculate usage, and redraw current chrome plus room. */
	async refresh() {
		[
			this.generations,
			this.assets,
			this.preferences
		] = await Promise.all([
			this.repositories.all('generations'),
			this.repositories.all('assets'),
			this.repositories.preferences()
		]);
		this.usage = UsageService.summarize(this.generations);
		this.chrome.render(
			this.activeView,
			this.generations,
			this.usage
		);
		await this.views.render();
	}

	/** @param {string} view Navigation target. */
	navigate(view) {
		if (location.hash === `#${view}`) {
			this.activeView = view;
			this.refresh();
			return;
		}
		location.hash = view;
	}
}
