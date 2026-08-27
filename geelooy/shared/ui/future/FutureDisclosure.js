//B"H
//Boruch Hashem
//Blessed is He

import { FutureDisclosureMemory } from './FutureDisclosureMemory.js?v=future-005';

/**
 * @module FutureDisclosure
 * @description
 * The Awtsmoos lets advanced power fold into native semantic chambers without hiding the road itself;
 * Awtsmoos.com applies responsive defaults only before user intent, while exact state memory avoids timing races in the night.
 */
const MOBILE_QUERY = '(max-width: 760px)';

export class FutureDisclosure {
	constructor(root = document) {
		this.root = root;
		this.environment = root.defaultView || globalThis;
		this.memory = new FutureDisclosureMemory(this.environment);
		this.mobile = this.environment.matchMedia?.(MOBILE_QUERY) || null;
		this.details = [];
		this.defaults = new WeakMap();
		this.programmatic = new WeakMap();
		this.listeners = new Map();
		this.onViewport = () => this.refreshDefaults();
	}

	start() {
		this.details = [...this.root.querySelectorAll('details[data-future-disclosure]')];
		for (const detail of this.details) this.initialize(detail);
		this.mobile?.addEventListener?.('change', this.onViewport);
		return this;
	}

	initialize(detail) {
		this.defaults.set(detail, detail.open);
		const stored = this.memory.read(detail);
		if (stored !== null) this.apply(detail, stored);
		else this.applyResponsiveDefault(detail);
		const listener = () => this.changed(detail);
		this.listeners.set(detail, listener);
		detail.addEventListener('toggle', listener);
	}

	changed(detail) {
		const expected = this.programmatic.get(detail);
		if (expected === detail.open) {
			this.programmatic.delete(detail);
			return;
		}
		detail.dataset.futureUserState = 'true';
		this.memory.write(detail, detail.open);
	}

	applyResponsiveDefault(detail) {
		if (detail.dataset.futureUserState === 'true') return;
		if (this.memory.read(detail) !== null) return;
		let next = this.defaults.get(detail) ?? detail.open;
		if (this.mobile?.matches && detail.hasAttribute('data-mobile-closed')) next = false;
		if (this.mobile?.matches && detail.hasAttribute('data-mobile-open')) next = true;
		this.apply(detail, next);
	}

	refreshDefaults() {
		for (const detail of this.details) this.applyResponsiveDefault(detail);
	}

	apply(detail, open) {
		if (detail.open === open) return;
		this.programmatic.set(detail, open);
		detail.open = open;
	}

	openFor(element) {
		const detail = element?.closest?.('details[data-future-disclosure]');
		if (!detail) return null;
		this.apply(detail, true);
		return detail;
	}

	stop() {
		this.mobile?.removeEventListener?.('change', this.onViewport);
		for (const detail of this.details) {
			const listener = this.listeners.get(detail);
			if (listener) detail.removeEventListener('toggle', listener);
		}
		this.details = [];
		this.listeners.clear();
	}
}

export {
	MOBILE_QUERY as FUTURE_DISCLOSURE_MOBILE_QUERY
};
