//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file Native3DPresentation.js
 * @description Lazily projects authoritative Connect 4 Worker boards as native
 * volumetric discs through Awtsmoos Procedural Core with no external libraries.
 *
 * Architectural invariants:
 * - Worker board copies are the only visual truth and this class never emits moves.
 * - 2D mode imports no 3D renderer and creates no WebGL context.
 * - Late imports are invalidated by an explicit mount generation.
 * - Renderer failure leaves the transferred 2D canvas visible and interactive.
 */
import { applyConnect4Native3DMode } from './Native3DPresentationMode.js';
import { loadConnect4Native3DRenderer } from './Native3DRendererLoader.js';
import { releaseConnect4Native3DPresentation } from './Native3DPresentationLifecycle.js';

export class Connect4Native3DPresentation {
	constructor(documentObject = document) {
		this.document = documentObject;
		this.source = null;
		this.overlay = null;
		this.wrapper = null;
		this.renderer = null;
		this.loading = null;
		this.board = null;
		this.generation = 0;
		this.active = documentObject.body.classList.contains('awtsmoosNative3D');
		this.modeHandler = event => this.setActive(Boolean(event.detail?.active));
		this.resizeHandler = () => this.renderer?.resize();
		globalThis.addEventListener('awtsmoos:native-3d-change', this.modeHandler);
		globalThis.addEventListener('resize', this.resizeHandler, { passive: true });
	}

	/** Wrap one fresh Worker-owned source canvas with a cheap optional overlay. */
	mount(source) {
		this.unmount();
		this.generation += 1;
		this.source = source;
		this.wrapper = this.document.createElement('div');
		this.wrapper.className = 'connect4RenderStack';
		this.overlay = this.document.createElement('canvas');
		this.overlay.className = 'connect4Native3DCanvas';
		this.overlay.setAttribute('aria-hidden', 'true');
		this.overlay.hidden = true;
		source.before(this.wrapper);
		this.wrapper.append(source, this.overlay);
		this.setActive(this.active);
	}

	/** Cache an accepted Worker board and project it only while 3D is active. */
	update(board) {
		if (!Array.isArray(board)) {
			return;
		}
		this.board = board;
		if (this.active) {
			this.ensureRenderer().then(renderer => renderer?.update(this.board));
		}
	}

	/** Switch projection while leaving the active Worker match untouched. */
	setActive(active) {
		applyConnect4Native3DMode(this, active);
	}

	/** Lazily create one renderer for the currently mounted board generation. */
	ensureRenderer() {
		if (this.renderer) {
			return Promise.resolve(this.renderer);
		}
		if (!this.loading) {
			const generation = this.generation;
			this.loading = loadConnect4Native3DRenderer(this, generation)
				.then(renderer => this.renderer = renderer)
				.finally(() => this.loading = null);
		}
		return this.loading;
	}

	/** Release one board overlay without terminating the authoritative Worker. */
	unmount() {
		releaseConnect4Native3DPresentation(this);
	}

	/** Release presentation listeners and the current optional renderer. */
	dispose() {
		this.unmount();
		globalThis.removeEventListener('awtsmoos:native-3d-change', this.modeHandler);
		globalThis.removeEventListener('resize', this.resizeHandler);
	}
}
