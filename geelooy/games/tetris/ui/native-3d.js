//B"H
//Boruch Hashem
//Blessed be He

import { COLS, COLORS, VISIBLE_ROWS } from '../constants.js';
import { applyTetrisNative3DMode } from './native-3d-mode.js';
import { ensureTetrisNative3DRenderer } from './native-3d-renderer.js';

/**
 * @file native-3d.js
 * @description Lazily projects canonical Tetris visual grids through the native
 * Awtsmoos Procedural Core while the Worker-owned 2D canvases remain authoritative.
 *
 * Architectural invariants:
 * - 2D mode imports no renderer graph and creates no WebGL context.
 * - Worker snapshots are the only cell truth; this class never computes game rules.
 * - Fresh Tetris canvas generations invalidate any pending renderer creation.
 * - Renderer failure leaves the original 2D game visible and fully playable.
 */
const PALETTE = Object.freeze({
	...COLORS,
	ghost: '#33485f'
});

export class TetrisNative3DPresentation {
	constructor(documentObject = document) {
		this.document = documentObject;
		this.entries = new Map();
		this.active = documentObject.body.classList.contains('awtsmoosNative3D');
		this.generation = 0;
		this.modeHandler = event => this.setActive(Boolean(event.detail?.active));
		globalThis.addEventListener('awtsmoos:native-3d-change', this.modeHandler);
	}

	/** Rebuild lightweight overlay vessels after transferable canvases change. */
	reset(canvases) {
		this.generation += 1;
		this.disposeEntries();
		this.createEntry(1, canvases.p1);
		if (canvases.p2) {
			this.createEntry(2, canvases.p2);
		}
		this.setActive(this.active);
	}

	/** Cache one renderer-only Worker matrix and project it only in active 3D mode. */
	update(snapshot) {
		const entry = this.entries.get(snapshot?.id);
		if (!entry || !Array.isArray(snapshot?.visualGrid)) {
			return;
		}
		entry.grid = snapshot.visualGrid;
		if (this.active) {
			this.ensureRenderer(entry).then(renderer => renderer?.update(entry.grid));
		}
	}

	/** Switch visual projection without mutating the current Worker run. */
	setActive(active) {
		applyTetrisNative3DMode(this, active);
	}

	/** Create one cheap overlay canvas without loading any 3D implementation. */
	createEntry(id, source) {
		const overlay = this.document.createElement('canvas');
		overlay.className = 'tetrisNative3DCanvas';
		overlay.setAttribute('aria-hidden', 'true');
		overlay.hidden = true;
		source.parentElement?.append(overlay);
		this.entries.set(id, {
			id,
			source,
			overlay,
			renderer: null,
			loading: null,
			grid: null,
			generation: this.generation
		});
	}

	/** Lazily create one current-generation native renderer. */
	ensureRenderer(entry) {
		return ensureTetrisNative3DRenderer(
			entry,
			() => this.entries.get(entry.id) === entry && entry.generation === this.generation,
			{ rows: VISIBLE_ROWS, columns: COLS, shape: 'cube', palette: PALETTE }
		);
	}

	/** Dispose board renderers while preserving the shared mode listener. */
	disposeEntries() {
		for (const entry of this.entries.values()) {
			entry.renderer?.dispose();
			entry.overlay.remove();
			entry.source.style.opacity = '';
		}
		this.entries.clear();
	}

	/** Release every optional presentation resource and listener. */
	dispose() {
		this.generation += 1;
		this.disposeEntries();
		globalThis.removeEventListener('awtsmoos:native-3d-change', this.modeHandler);
	}
}
