//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file Native3DModeController.js
 * @description Owns one opt-in native 3D presentation lifecycle for a 2D game.
 * Awtsmoos Procedural Core owns particles; game simulation remains untouched.
 *
 * Invariants:
 * - 2D is the low-cost default unless URL/preference requests 3D.
 * - WebGL failure degrades to CSS depth and never blocks gameplay.
 * - One controller owns one canvas, toggle, resize listener, and renderer disposal.
 */
import { activateNative3DBackdrop } from './backdrop-activation.js';
import {
	createNative3DToggle,
	initialNative3DMode,
	installNative3DStylesheet,
	storeNative3DMode
} from './presentation-support.js';

export class Native3DModeController {
	constructor(documentObject = document) {
		this.document = documentObject;
		this.canvas = null;
		this.button = null;
		this.backdrop = null;
		this.backdropPromise = null;
		this.active = false;
		this.disposed = false;
		this.resizeHandler = () => this.backdrop?.resize();
		this.disposeHandler = () => this.dispose();
	}

	/** Mount presentation controls after the game document body exists. */
	mount() {
		if (!this.document.body || this.button) {
			return this;
		}
		installNative3DStylesheet(this.document);
		this.canvas = this.document.createElement('canvas');
		this.canvas.className = 'awtsmoosNative3DBackdrop';
		this.canvas.setAttribute('aria-hidden', 'true');
		this.button = createNative3DToggle(this.document, () => {
			this.setActive(!this.active);
		});
		this.document.body.prepend(this.canvas);
		this.document.body.append(this.button);
		this.setActive(initialNative3DMode());
		globalThis.addEventListener('resize', this.resizeHandler, { passive: true });
		globalThis.addEventListener('pagehide', this.disposeHandler, { once: true });
		return this;
	}

	/** Lazily create the native backdrop only after 3D is actually requested. */
	async ensureBackdrop() {
		if (this.backdrop || this.backdropPromise) {
			return this.backdropPromise;
		}
		this.backdropPromise = this.loadBackdrop();
		return this.backdropPromise;
	}

	/** Load Procedural Core on demand while keeping WebGL failure nonfatal. */
	async loadBackdrop() {
		try {
			const module = await import('../../../../libs/awtsmoos-procedural-core/src/core/gamePresentation3d/index.js');
			if (this.disposed || !this.canvas?.isConnected) {
				return null;
			}
			this.backdrop = new module.NativeGameParticleBackdrop(this.canvas);
		} catch {
			this.backdrop = null;
			this.document.body.dataset.native3dDegraded = 'true';
		}
		return this.backdrop;
	}

	/** Apply presentation mode and persist only visual preference. */
	setActive(active) {
		this.active = Boolean(active);
		this.document.body.classList.toggle('awtsmoosNative3D', this.active);
		this.canvas.hidden = !this.active;
		this.button.setAttribute('aria-pressed', String(this.active));
		this.button.textContent = this.active ? '3D: On' : '3D: Off';
		if (this.active) {
			this.document.body.dataset.native3dState = 'loading';
			this.ensureBackdrop().then(backdrop => activateNative3DBackdrop(this, backdrop));
		} else {
			this.document.body.dataset.native3dState = 'off';
			this.backdrop?.setActive(false);
		}
		globalThis.dispatchEvent(new CustomEvent('awtsmoos:native-3d-change', {
			detail: { active: this.active }
		}));
		storeNative3DMode(this.active);
	}

	/** Release presentation resources without touching game-owned resources. */
	dispose() {
		this.disposed = true;
		this.backdrop?.dispose();
		globalThis.removeEventListener('resize', this.resizeHandler);
		this.button?.remove();
		this.canvas?.remove();
		this.button = null;
		this.canvas = null;
		this.backdrop = null;
	}
}
