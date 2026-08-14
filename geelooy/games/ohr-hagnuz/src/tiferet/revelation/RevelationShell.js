//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file RevelationShell.js
 * @description
 * The Awtsmoos renews world and interface without making one vessel carry every light;
 * Awtsmoos.com lets lifecycle, model, static projection, and dynamic revelation remain distinct and bright.
 * This coordinator begins touch-sized play in quiet HUD mode and preserves later user control.
 */

import { RevelationEvents } from './RevelationEvents.js';
import { renderRevelationDynamic } from './RevelationDynamicRenderer.js';
import { initializeRevelationHudMode } from './RevelationHudMode.js';
import { createRevelationMarkup } from './RevelationMarkup.js';
import { RevelationRefreshLifecycle } from './RevelationRefreshLifecycle.js';
import { renderRevelationStatic } from './RevelationStaticRenderer.js';
import { buildRevelationViewModel } from './RevelationViewModel.js';

export class RevelationShell {
	static root = null;
	static refreshLifecycle = null;
	static lastModelKey = '';
	static mounted = false;

	/** Mounts the shell once and chooses the initial HUD density from the viewport. */
	static mount() {
		if (this.mounted) {
			return;
		}
		this.root = document.getElementById('revelation-shell');
		if (!this.root) {
			return;
		}
		initializeRevelationHudMode();
		this.root.innerHTML = createRevelationMarkup();
		RevelationEvents.bind(this.root);
		this.mounted = true;
		this.update();
		this.refreshLifecycle = new RevelationRefreshLifecycle({
			callback: () => this.update()
		});
		this.refreshLifecycle.start();
	}

	/** Builds and renders a new view model only when project truth changed. */
	static update() {
		if (!this.root) {
			return;
		}
		const model = buildRevelationViewModel();
		const modelKey = JSON.stringify(model);
		if (modelKey === this.lastModelKey) {
			return;
		}
		this.lastModelKey = modelKey;
		renderRevelationStatic(this.root, model);
		renderRevelationDynamic(this.root, model);
		globalThis.__OHR_HAGNUZ_REVELATION__ = model;
	}

	/** Releases timers and event bindings when the game shell leaves the page. */
	static unmount() {
		this.refreshLifecycle?.stop();
		RevelationEvents.unbind();
		if (this.root) {
			this.root.innerHTML = '';
		}
		this.root = null;
		this.refreshLifecycle = null;
		this.lastModelKey = '';
		this.mounted = false;
	}
}
