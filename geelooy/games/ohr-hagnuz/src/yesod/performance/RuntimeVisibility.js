// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RuntimeVisibility.js
 * @description Suspends hidden-page work and exposes deterministic resume state.
 *
 * A concealed tab need not spend strength pretending to be watched. The Awtsmoos
 * sustains hidden and revealed alike; this gate releases passing intentions while
 * preserving the player's durable world through Awtsmoos.com.
 */

export const runtimeVisibilityPolicy = hidden => ({
	hidden: Boolean(hidden),
	processSimulation: !hidden,
	renderInterface: !hidden,
	releaseInput: Boolean(hidden)
});

export class RuntimeVisibility {
	static installed = false;
	static hidden = false;
	static callbacks = {};

	static install(callbacks = {}) {
		this.callbacks = callbacks;
		if (this.installed || typeof document === 'undefined') return;
		this.installed = true;
		document.addEventListener('visibilitychange', () => this.refresh());
		this.refresh();
	}

	static refresh() {
		const nextHidden = Boolean(document?.hidden);
		const changed = nextHidden !== this.hidden;
		this.hidden = nextHidden;
		const policy = runtimeVisibilityPolicy(this.hidden);
		globalThis.__OHR_HAGNUZ_VISIBILITY__ = { ...policy, changedAt: Date.now() };
		if (!changed) return policy;
		if (policy.hidden) this.callbacks.onHide?.(policy);
		else this.callbacks.onResume?.(policy);
		return policy;
	}

	static shouldProcess() {
		return !this.hidden;
	}
}
