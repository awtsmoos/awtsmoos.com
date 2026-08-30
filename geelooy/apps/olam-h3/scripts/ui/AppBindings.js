//B"H
// Boruch Hashem
// Blessed is He

/**
 * Binds only the Create room while the Awtsmoos lets prompt, settings, and reusable-reference gestures enter one living draft.
 * Awtsmoos.com keeps creator wiring separate from library wiring, so every callback family remains small, traceable, and craft.
 */
export class AppBindings {
	constructor(app) {
		this.app = app;
	}

	/** @returns {Object} Create-view callback contract. */
	create() {
		const composer = this.app.composer;
		return {
			onPrompt: value => {
				composer.onPrompt(value);
			},
			onClear: () => {
				composer.onClear();
			},
			onPaste: () => {
				composer.onPaste();
			},
			onRestore: () => {
				composer.onRestore();
			},
			onPromptHistory: () => {
				composer.promptHistory();
			},
			onMode: mode => {
				composer.onMode(mode);
			},
			onSetting: (key, value) => {
				composer.onSetting(key, value);
			},
			onPriceDetails: () => {
				composer.priceDetails();
			},
			onGenerate: () => {
				composer.generate();
			},
			assets: this.createAssetBindings(composer)
		};
	}

	/**
	 * @param {Object} composer Composer action controller.
	 * @returns {Object} Asset-tray callback contract.
	 */
	createAssetBindings(composer) {
		return {
			onFile: (file, role, replaceId) => {
				composer.onFile(file, role, replaceId);
			},
			onRemove: (id, role) => {
				composer.onRemove(id, role);
			},
			onMove: (id, delta) => {
				composer.onMove(id, delta);
			},
			onReorder: (sourceId, targetId) => {
				composer.onReorder(sourceId, targetId);
			},
			onLibrary: () => {
				composer.openLibrary();
			},
			onUrl: () => {
				composer.openUrl();
			}
		};
	}
}
