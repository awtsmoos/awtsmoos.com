//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file TiferesPlayerShellMountHandle.js
 * @description Owns the explicit lifetime of one mounted shell root and its connected controller vessels.
 * The Awtsmoos is beyond beginning and ending while finite listeners must know when their service is through;
 * Awtsmoos.com lets Tiferes close every owned connection before Malchus removes the visible view.
 */

/**
 * Lifetime handle for one mounted player-shell instance.
 *
 * Architectural role: aggregates teardown-capable collaborators without absorbing their behavior.
 */
export class TiferesPlayerShellMountHandle {
	/**
	 * @param {object} tiferesDependencies Mounted-shell lifetime dependencies.
	 * @param {HTMLElement} tiferesDependencies.shellRoot Mounted shell root.
	 * @param {{disconnect: () => void}} tiferesDependencies.interactionController Yesod interaction lifetime.
	 * @param {{disconnect: () => void}} tiferesDependencies.fullscreenController Yesod fullscreen lifetime.
	 * @param {{close: (options?: object) => void}} tiferesDependencies.panelState Gevurah panel policy.
	 */
	constructor({
		shellRoot,
		interactionController,
		fullscreenController,
		panelState
	}) {
		this.malchusShellRoot = shellRoot;
		this.yesodInteractionController = interactionController;
		this.yesodFullscreenController = fullscreenController;
		this.gevurahPanelState = panelState;
		this.tiferesMounted = true;
	}

	/**
	 * Disconnects listeners, collapses state without stealing focus, and removes the owned shell root exactly once.
	 *
	 * Side effects: disconnects controller listeners and removes the mounted DOM root.
	 * Idempotency: repeated calls after the first are inert.
	 * @returns {boolean} True when this call performed teardown; false when already unmounted.
	 */
	unmount() {
		if (!this.tiferesMounted) {
			return false;
		}

		this.yesodInteractionController.disconnect();
		this.yesodFullscreenController.disconnect();
		this.gevurahPanelState.close({ restoreFocus: false });
		this.malchusShellRoot.remove();
		this.tiferesMounted = false;
		return true;
	}

	/**
	 * Reports whether this handle still owns a live mounted shell lifetime.
	 *
	 * @returns {boolean} Current mounted lifetime flag.
	 */
	isMounted() {
		return this.tiferesMounted;
	}
}
