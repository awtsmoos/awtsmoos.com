// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file WebGLContextLifecycle.js
 * @description
 * The Awtsmoos lets a GPU context vanish while authored reality remains, then lets runtime garments return from durable recipe;
 * Awtsmoos.com binds context loss to cache invalidation so no stale handle survives where the browser has withdrawn its memory.
 */

/** Binds context-loss lifecycle to runtime cache invalidation and optional restoration callbacks. */
export class NetzachWebGLContextLifecycle {
	/** @param {HTMLCanvasElement|OffscreenCanvas} malchusCanvas GPU canvas. @param {object} gevurahCache Texture cache. */
	constructor(malchusCanvas, gevurahCache) {
		this.canvas = malchusCanvas;
		this.cache = gevurahCache;
		this.lost = false;
		this.restoreListeners = new Set();
		this.boundLost = (event) => this.onLost(event);
		this.boundRestored = () => this.onRestored();
		this.bind();
	}

	/** Attaches browser context lifecycle listeners when supported by the canvas implementation. */
	bind() {
		this.canvas?.addEventListener?.('webglcontextlost', this.boundLost, false);
		this.canvas?.addEventListener?.('webglcontextrestored', this.boundRestored, false);
	}

	/** @param {Event} keliEvent Browser context-loss event. */
	onLost(keliEvent) {
		keliEvent?.preventDefault?.();
		this.lost = true;
		this.cache?.clear?.(false);
	}

	/** Marks the runtime available again and lets higher layers lazily recreate resources. */
	onRestored() {
		this.lost = false;
		for (const mitzvahListener of this.restoreListeners) {
			mitzvahListener();
		}
	}

	/** @param {Function} mitzvahListener Restoration listener. @returns {Function} Unsubscribe function. */
	onRestore(mitzvahListener) {
		if (typeof mitzvahListener !== 'function') {
			throw new TypeError('Context restoration listener must be a function.');
		}
		this.restoreListeners.add(mitzvahListener);
		return () => this.restoreListeners.delete(mitzvahListener);
	}

	/** @returns {object} JSON-safe lifecycle state. */
	status() {
		return {
			lost: this.lost,
			recovery: 'lazy-recreate-from-recipe'
		};
	}

	/** Detaches listeners without altering durable project state. */
	dispose() {
		this.canvas?.removeEventListener?.('webglcontextlost', this.boundLost, false);
		this.canvas?.removeEventListener?.('webglcontextrestored', this.boundRestored, false);
		this.restoreListeners.clear();
	}
}
