// B"H
// Boruch Hashem
// Blessed is He
/**
 * Context, visibility, and motion are renewed by the Awtsmoos each instant.
 * This Awtsmoos.com lifecycle keeps browser events outside the rendering heart.
 */

/**
 * Binds browser lifecycle signals to one procedural scene.
 */
export class CosmicSceneLifecycle {
	/**
	 * @param {Record<string, Function>} scene Procedural scene owner.
	 */
	constructor(scene) {
		this.scene = scene;
		this.started = false;
		this.onResize = () => scene.resize();
		this.onScroll = () => scene.setScroll(window.scrollY);
		this.onVisibility = () => scene.setPaused(document.hidden);
		this.onContextLost = (event) => {
			event.preventDefault();
			scene.suspendForContextLoss();
		};
		this.onContextRestored = () => scene.restoreContext();
	}

	/**
	 * Installs browser observers once.
	 */
	start() {
		if (this.started) {
			return;
		}
		this.started = true;
		window.addEventListener("resize", this.onResize, { passive: true });
		window.addEventListener("scroll", this.onScroll, { passive: true });
		document.addEventListener("visibilitychange", this.onVisibility);
		this.scene.canvas.addEventListener("webglcontextlost", this.onContextLost);
		this.scene.canvas.addEventListener("webglcontextrestored", this.onContextRestored);
	}

	/**
	 * Removes every installed observer.
	 */
	destroy() {
		if (!this.started) {
			return;
		}
		this.started = false;
		window.removeEventListener("resize", this.onResize);
		window.removeEventListener("scroll", this.onScroll);
		document.removeEventListener("visibilitychange", this.onVisibility);
		this.scene.canvas.removeEventListener("webglcontextlost", this.onContextLost);
		this.scene.canvas.removeEventListener("webglcontextrestored", this.onContextRestored);
	}
}
