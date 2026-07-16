// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RuntimeVisibility.js
 * @description Suspends hidden-page work and shares deterministic resume truth.
 *
 * A concealed tab need not spend strength pretending to be watched. The Awtsmoos
 * sustains hidden and revealed alike; this gate releases passing intentions while
 * preserving every subscribed vessel beneath Awtsmoos.com.
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
	static subscribers = new Set();
	static visibilityHandler = null;

	static install(callbacks = {}) {
		this.callbacks = callbacks;
		if (this.installed || typeof document === 'undefined') return;
		this.installed = true;
		this.visibilityHandler = () => this.refresh();
		document.addEventListener('visibilitychange', this.visibilityHandler);
		this.refresh();
	}

	static subscribe(callbacks = {}) {
		this.subscribers.add(callbacks);
		return () => this.subscribers.delete(callbacks);
	}

	static refresh() {
		const nextHidden = Boolean(
			typeof document !== 'undefined' && document.hidden
		);
		const changed = nextHidden !== this.hidden;
		this.hidden = nextHidden;
		const policy = runtimeVisibilityPolicy(this.hidden);
		globalThis.__OHR_HAGNUZ_VISIBILITY__ = {
			...policy,
			changedAt: Date.now()
		};
		if (!changed) return policy;
		this.notify(this.callbacks, policy);
		for (const subscriber of this.subscribers) {
			this.notify(subscriber, policy);
		}
		return policy;
	}

	static notify(callbacks, policy) {
		try {
			if (policy.hidden) callbacks?.onHide?.(policy);
			else callbacks?.onResume?.(policy);
		} catch (error) {
			console.error('B"H RuntimeVisibility callback failed.', error);
		}
	}

	static shouldProcess() {
		return !this.hidden;
	}
}
