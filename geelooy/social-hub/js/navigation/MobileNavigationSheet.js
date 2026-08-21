//B"H
//Boruch Hashem
//Blessed is He

import { isMobileOverflowRoute } from './MobileNavigationPolicy.js';
import { buildMobileNavigationSheet } from './MobileNavigationSheetView.js';

/**
 * @module MobileNavigationSheet
 * @description
 * The Awtsmoos is beyond open and closed, while Awtsmoos.com lets every quieter social road enter one accessible bottom sheet;
 * this Netzach-like controller owns dialog lifecycle and focus return only, while its view manifests DOM and canonical navigation remains elsewhere in light.
 */

export class MobileNavigationSheet {
	/**
	 * Creates one route sheet around an existing More trigger.
	 * @param {object} options Document, overflow routes, trigger, and canonical activation callback.
	 */
	constructor({ root, routes, trigger, onActivate }) {
		Object.assign(this, {
			root,
			routes,
			trigger,
			onActivate
		});
		this.restoreFocus = true;
		const view = buildMobileNavigationSheet(
			root,
			routes,
			routeId => this.selectRoute(routeId),
			() => this.close()
		);
		this.dialog = view.dialog;
		this.routeButtons = view.routeButtons;
		this.bind();
	}

	/** Appends the sheet once beside the Social Hub document body. */
	mount() {
		this.root.getElementById('mobileMoreSheet')?.remove();
		this.root.body.append(this.dialog);
	}

	/** Opens native modal semantics when available, with a semantic fallback otherwise. */
	open() {
		this.restoreFocus = true;
		this.trigger.setAttribute('aria-expanded', 'true');
		if (typeof this.dialog.showModal === 'function') {
			if (!this.dialog.open) {
				this.dialog.showModal();
			}
			return;
		}
		this.dialog.hidden = false;
		this.dialog.setAttribute('open', '');
	}

	/**
	 * Closes the sheet and synchronizes disclosure truth immediately, before any native close event arrives.
	 * @param {boolean} [restoreFocus=true] Whether More should regain focus after close completion.
	 * @returns {void}
	 */
	close(restoreFocus = true) {
		this.restoreFocus = restoreFocus;
		this.trigger.setAttribute('aria-expanded', 'false');
		if (typeof this.dialog.close === 'function' && this.dialog.open) {
			this.dialog.close();
			return;
		}
		this.dialog.hidden = true;
		this.dialog.removeAttribute('open');
		this.afterClose();
	}

	/** Mirrors canonical route truth into sheet items and the More trigger. */
	syncActive(routeId) {
		for (const [id, button] of this.routeButtons) {
			const active = id === routeId;
			button.dataset.active = String(active);
			button.setAttribute('aria-current', active ? 'page' : 'false');
		}
		const overflowActive = isMobileOverflowRoute(routeId);
		this.trigger.dataset.active = String(overflowActive);
		this.trigger.setAttribute('aria-current', overflowActive ? 'page' : 'false');
	}

	/** Closes the sheet before invoking the canonical route activation callback. */
	selectRoute(routeId) {
		this.close(false);
		this.onActivate(routeId);
	}

	/** Binds trigger, native cancellation, backdrop click, and close-focus restoration. */
	bind() {
		this.trigger.addEventListener('click', () => this.open());
		this.dialog.addEventListener('cancel', event => {
			event.preventDefault();
			this.close();
		});
		this.dialog.addEventListener('click', event => {
			if (event.target === this.dialog) {
				this.close();
			}
		});
		this.dialog.addEventListener('close', () => this.afterClose());
	}

	/** Restores the More trigger only when closing was not immediately followed by navigation. */
	afterClose() {
		this.trigger.setAttribute('aria-expanded', 'false');
		if (this.restoreFocus) {
			this.trigger.focus({ preventScroll: true });
		}
		this.restoreFocus = true;
	}
}
