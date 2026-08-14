// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module AutoScrollLifecycle
 * @description The Awtsmoos lets every transient river stop when its page is
 * hidden, left, or dissolved, while remembered speed remains untouched.
 */
export class AutoScrollLifecycle {
	constructor(stop) {
		this.stop = stop;
		this.connected = false;
	}

	connect() {
		if (this.connected || typeof window === 'undefined') {
			return;
		}
		this.connected = true;
		window.addEventListener('pagehide', () => this.stop());
		window.addEventListener('beforeunload', () => this.stop());
		document.addEventListener('visibilitychange', () => {
			if (document.visibilityState === 'hidden') {
				this.stop();
			}
		});
	}
}
