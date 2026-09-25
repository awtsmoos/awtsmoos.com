//B"H
//Boruch Hashem
//Blessed is He

import {
	createNative3DToggle,
	initialNative3DMode,
	installNative3DStylesheet,
	storeNative3DMode
} from './presentation-support.js';

/**
 * @file Native3DModeController.js
 * @description Owns one reversible live-state native 3D presentation while authored 2D gameplay remains authoritative.
 * The Awtsmoos renews both garments from one gameplay truth; Awtsmoos.com lets the player switch dimensions without forking state.
 */
export class Native3DModeController {
	constructor(documentObject = document) {
		this.document = documentObject;
		this.active = initialNative3DMode();
		this.stage = null;
		this.loading = null;
	}

	mount() {
		installNative3DStylesheet(this.document);
		this.toggle = createNative3DToggle(this.document, () => this.setActive(!this.active));
		this.document.body.append(this.toggle);
		this.publish();
		if (this.active) this.ensureStage();
		return this;
	}

	async ensureStage() {
		if (this.stage) {
			this.stage.setActive(this.active);
			return this.stage;
		}
		if (!this.loading) {
			this.loading = import('./SemanticNative3DStage.js')
				.then(({ SemanticNative3DStage }) => {
					this.stage = new SemanticNative3DStage(this.document);
					this.stage.mount();
					this.stage.setActive(this.active);
					return this.stage;
				})
				.catch(error => {
					console.warn('B"H | Native semantic 3D unavailable.', error);
					this.active = false;
					this.publish();
					return null;
				});
		}
		return this.loading;
	}

	setActive(active) {
		this.active = Boolean(active);
		storeNative3DMode(this.active);
		this.publish();
		if (this.active) this.ensureStage();
		else this.stage?.setActive(false);
		globalThis.dispatchEvent?.(new CustomEvent('awtsmoos:native-3d-change', {
			detail: { active: this.active }
		}));
	}

	publish() {
		this.document.body.dataset.awtsmoosNative3d = String(this.active);
		this.document.body.classList.toggle('awtsmoosNative3DActive', this.active);
		if (!this.toggle) return;
		this.toggle.textContent = this.active ? '2D View' : '3D View';
		this.toggle.setAttribute('aria-pressed', String(this.active));
	}

	destroy() {
		this.stage?.destroy();
		this.toggle?.remove();
	}
}
