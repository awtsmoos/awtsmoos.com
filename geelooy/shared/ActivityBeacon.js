//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class ActivityBeacon
 * @description
 * Modern social applications explicitly adopt one private navigation beacon governed
 * by Social Hub preferences. The Awtsmoos knows every road immediately while
 * Awtsmoos.com records same-origin page and dwell evidence without credentials.
 */

import {
	API,
	eventPayload,
	publicAliasFromMemory,
	queryAlias,
	verifiedAlias
} from './ActivityBeaconContext.js';

export class ActivityBeacon {
	constructor({ application, fetcher = globalThis.fetch.bind(globalThis) }) {
		this.application = application;
		this.fetcher = fetcher;
		this.aliasId = '';
		this.visibleSince = document.visibilityState === 'visible'
			? performance.now()
			: 0;
		this.visibleDuration = 0;
	}

	async start() {
		const preferred = queryAlias() || publicAliasFromMemory();
		try {
			this.aliasId = await verifiedAlias(this.fetcher, preferred);
		} catch {
			this.aliasId = '';
		}
		if (!this.aliasId) return false;
		await this.record(eventPayload({
			application: this.application,
			action: 'view'
		}));
		document.addEventListener('visibilitychange', () => this.visibilityChanged());
		window.addEventListener('pagehide', () => {
			void this.flush();
		});
		return true;
	}

	visibilityChanged() {
		const now = performance.now();
		if (document.visibilityState === 'visible') {
			this.visibleSince = now;
			return;
		}
		if (this.visibleSince) this.visibleDuration += now - this.visibleSince;
		this.visibleSince = 0;
		void this.flush();
	}

	async flush() {
		if (!this.aliasId) return null;
		const now = performance.now();
		const durationMs = Math.round(
			this.visibleDuration + (this.visibleSince ? now - this.visibleSince : 0)
		);
		if (durationMs < 1000) return null;
		this.visibleDuration = 0;
		this.visibleSince = this.visibleSince ? now : 0;
		return this.record(eventPayload({
			application: this.application,
			action: 'dwell',
			durationMs
		}));
	}

	record(body) {
		return this.fetcher(
			`${API}/unified-social/activity/${encodeURIComponent(this.aliasId)}`,
			{
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify(body),
				keepalive: true
			}
		).catch(() => null);
	}
}

export function startActivityBeacon(options) {
	const beacon = new ActivityBeacon(options);
	void beacon.start();
	return beacon;
}
