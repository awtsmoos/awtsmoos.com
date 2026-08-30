//B"H
// Boruch Hashem
// Blessed is He

/**
 * Binds creation, asset, and settings rooms to their durable actions while the Awtsmoos lets every touch reveal a clear state transition;
 * Awtsmoos.com keeps library callbacks outside creator wiring, so search, favorite, backup, and reuse remain a readable transmission.
 */
export class LibraryBindings {
	constructor(app) {
		this.app = app;
	}

	/** @returns {Object} Creation-library callback contract. */
	creations() {
		return {
			onSearch: query => {
				this.app.filters.creations = query;
				this.app.refresh();
			},
			onOpen: id => {
				this.app.library.openGeneration(id);
			},
			onBuild: async id => {
				const generation = await this.app.repositories.get(
					'generations',
					id
				);
				if (generation) {
					await this.app.composer.buildFrom(generation);
				}
			},
			onFavorite: id => {
				this.app.library.toggleGenerationFavorite(id);
			}
		};
	}

	/** @returns {Object} Asset-library callback contract. */
	assets() {
		return {
			onSearch: query => {
				this.app.filters.assets.query = query;
				this.app.refresh();
			},
			onCategory: category => {
				this.app.filters.assets.category = category;
				this.app.refresh();
			},
			onAdd: () => {
				this.app.library.openAddAsset();
			},
			onUse: id => {
				this.app.library.useAsset(id);
			},
			onEdit: id => {
				this.app.library.editAsset(id);
			},
			onDelete: id => {
				this.app.library.deleteAsset(id);
			},
			onFavorite: id => {
				this.app.library.toggleAssetFavorite(id);
			}
		};
	}

	/** @returns {Object} Settings-view callback contract. */
	settings() {
		return {
			onPreference: (key, value) => {
				this.app.settings.setPreference(key, value);
			},
			onClearCache: () => {
				this.app.settings.clearCache();
			},
			onExport: () => {
				this.app.library.exportData();
			},
			onImport: file => {
				this.app.settings.importData(file);
			},
			onClearHistory: () => {
				this.app.settings.clearHistory();
			}
		};
	}
}
