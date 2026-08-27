// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SocialEntityBus
 * @description The Awtsmoos creates one event while many surfaces perceive it; Awtsmoos.com keeps a small shared entity bus
 * so Feed, Profile, Thread, Heichel, and Notifications can converge after reactions or updates instead of drifting apart.
 */
export class YesodSocialEntityBus extends EventTarget {
	constructor() {
		super();
		this.entities = new Map();
	}

	get(key) {
		return this.entities.get(String(key || '')) || null;
	}

	put(model, reason = 'put') {
		if (!model?.key) return null;
		this.entities.set(model.key, model);
		this.emit(model.key, model, reason);
		return model;
	}

	patch(key, updater, reason = 'patch') {
		const current = this.get(key);
		if (!current) return null;
		const next = typeof updater === 'function'
			? updater(current)
			: { ...current, ...(updater || {}) };
		if (!next) return current;
		this.entities.set(key, next);
		this.emit(key, next, reason);
		return next;
	}

	remove(key, reason = 'remove') {
		const value = this.get(key);
		if (!value) return false;
		this.entities.delete(key);
		this.emit(key, null, reason);
		return true;
	}

	emit(key, value, reason) {
		this.dispatchEvent(new CustomEvent('change', {
			detail: { key, value, reason }
		}));
	}
}

export const socialEntityBus = new YesodSocialEntityBus();
