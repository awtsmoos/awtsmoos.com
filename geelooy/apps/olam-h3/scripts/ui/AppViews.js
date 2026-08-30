//B"H
// Boruch Hashem
// Blessed is He

import { CreateView } from './CreateView.js';
import { CreationsView } from './CreationsView.js';
import { AssetsView } from './AssetsView.js';
import { UsageView } from './UsageView.js';
import { SettingsView } from './SettingsView.js';
import { AppBindings } from './AppBindings.js';
import { LibraryBindings } from './LibraryBindings.js';

/**
 * Reveals only the active studio room while the Awtsmoos lets one durable state become many useful faces without confusion;
 * Awtsmoos.com keeps creator and library callback families separate, so rendering remains a small and readable infusion.
 */
export class AppViews {
	constructor(app) {
		this.app = app;
		const creatorBindings = new AppBindings(app);
		const libraryBindings = new LibraryBindings(app);
		this.views = {
			create: new CreateView(creatorBindings.create()),
			creations: new CreationsView(libraryBindings.creations()),
			assets: new AssetsView(libraryBindings.assets()),
			usage: new UsageView(),
			settings: new SettingsView(libraryBindings.settings())
		};
	}

	/** Render and bind the current room into the application content root. */
	async render() {
		const view = this.views[this.app.activeView] || this.views.create;
		const markup = await this.markup(view);
		this.app.root.innerHTML = markup;
		view.bind(this.app.root);
	}

	/**
	 * @param {Object} view Active view instance.
	 * @returns {Promise<string>} Markup for current application state.
	 */
	async markup(view) {
		if (this.app.activeView === 'create') {
			return view.render(await this.app.composer.state());
		}
		if (this.app.activeView === 'creations') {
			return view.render(
				this.app.generations,
				this.app.filters.creations
			);
		}
		if (this.app.activeView === 'assets') {
			return view.render(
				this.app.assets,
				this.app.filters.assets
			);
		}
		if (this.app.activeView === 'usage') {
			return view.render(this.app.usage);
		}

		return view.render({
			preferences: this.app.preferences,
			connection: this.app.connection,
			storage: this.app.storage
		});
	}
}
