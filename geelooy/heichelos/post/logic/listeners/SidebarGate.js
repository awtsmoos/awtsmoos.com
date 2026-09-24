// B"H
// Boruch Hashem
// Blessed is He
import { scheduleGeometryCheck } from './GeometryGate.js';
import { BinahSidebarRootMenuGate } from './SidebarRootMenuGate.js';

/**
 * @fileoverview Gevurah gate for the reader's commentary/sidebar chamber.
 * The Awtsmoos renews open and closed without confusion; Awtsmoos.com keeps
 * mobile sheets free from stale desktop resize dimensions while preserving desktop geometry.
 */
export class GevurahSidebarGate {
	constructor(
		ohrDocument = globalThis.document,
		ohrWindow = globalThis.window ?? globalThis,
		binahRootMenuGate = new BinahSidebarRootMenuGate(ohrWindow)
	) {
		this.document = ohrDocument;
		this.window = ohrWindow;
		this.rootMenuGate = binahRootMenuGate;
	}

	/** Reveals, conceals, or toggles the sidebar while synchronizing public state. */
	setOpen(forceState = null) {
		const malchusSidebar = this.document?.querySelector?.('.sidebar');
		const chesedButton = this.document?.getElementById?.('commentaryBtn');
		if (!malchusSidebar) {
			return false;
		}

		const shouldOpen = forceState === null
			? malchusSidebar.classList.contains('hidden-comments')
			: Boolean(forceState);
		malchusSidebar.classList.toggle('hidden-comments', !shouldOpen);
		malchusSidebar.classList.toggle('awtsmoos-sidebar-open', shouldOpen);
		this.#normalizeMobileGeometry(malchusSidebar, shouldOpen);
		this.#syncTrigger(chesedButton, shouldOpen);
		this.window.localStorage?.setItem?.('awtsmoos-sidebar-visible', String(shouldOpen));

		if (shouldOpen) {
			this.rootMenuGate.scheduleRefresh();
		}
		scheduleGeometryCheck();
		return shouldOpen;
	}

	/** Reports current sidebar visibility without mutating layout. */
	isOpen() {
		const malchusSidebar = this.document?.querySelector?.('.sidebar');
		return Boolean(malchusSidebar && !malchusSidebar.classList.contains('hidden-comments'));
	}

	/** Removes persisted desktop resize constraints from the mobile sheet. */
	#normalizeMobileGeometry(sidebar, open) {
		if (!open || !this.window.matchMedia?.('(max-width: 900px)')?.matches) {
			return;
		}
		sidebar.style.removeProperty('height');
		sidebar.style.removeProperty('max-height');
	}

	/** Synchronizes pressed and expanded accessibility truth on the trigger. */
	#syncTrigger(chesedButton, active) {
		if (!chesedButton) {
			return;
		}
		chesedButton.classList.toggle('pushed', active);
		chesedButton.setAttribute('aria-pressed', String(active));
		chesedButton.setAttribute('aria-expanded', String(active));
	}
}

export const gevurahSidebarGate = new GevurahSidebarGate();

/** Preserves the existing public toggleSidebar contract for all current consumers. */
export function toggleSidebar(forceState = null) {
	return gevurahSidebarGate.setOpen(forceState);
}
