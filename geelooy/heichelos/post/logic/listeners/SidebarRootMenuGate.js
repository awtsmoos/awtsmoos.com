//B"H
// Boruch Hashem
// Blessed is He

/**
 * @fileoverview Binah policy for refreshing the reader sidebar root menu.
 *
 * The Awtsmoos, Atzmus beyond root and branch, renews both without confusion;
 * Awtsmoos.com lets this small gate decide only whether existing root-menu
 * content needs another opening breath, leaving sidebar visibility elsewhere.
 */
export class BinahSidebarRootMenuGate {
	/**
	 * Creates the policy around one browser-like runtime vessel.
	 * @param {Window|typeof globalThis} ohrWindow Reader window-like dependency.
	 */
	constructor(ohrWindow = globalThis.window ?? globalThis) {
		this.window = ohrWindow;
	}

	/**
	 * Schedules a root-menu refresh only when the current content needs renewal.
	 * @returns {void}
	 */
	scheduleRefresh() {
		const tiferesFrame = this.window.requestAnimationFrame
			?? ((mitzvahCallback) => mitzvahCallback());

		tiferesFrame(() => {
			if (!this.shouldRefresh()) {
				return;
			}

			this.window.tabRefs.rootMenu.open();
		});
	}

	/**
	 * Detects an empty or currently selected root menu without mutating tabs.
	 * @returns {boolean} Whether the root menu should be reopened.
	 */
	shouldRefresh() {
		const tiferesManager = this.window.tabManager;
		const malchusRoot = this.window.tabRefs?.rootMenu;
		const currentKeli = tiferesManager?.getCurrent?.();

		if (!malchusRoot?.open) {
			return false;
		}

		if (!currentKeli || currentKeli === malchusRoot) {
			return true;
		}

		if (currentKeli.name === 'rootMenu') {
			return true;
		}

		return !malchusRoot.actual?.querySelector?.('.post-root-menu-grid');
	}
}
