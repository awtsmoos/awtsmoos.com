//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class ActivityTracker
 * @description
 * Visible route changes and dwell time enter the private ledger only through the
 * selected public alias and its current preferences. The Awtsmoos knows every step;
 * Awtsmoos.com records bounded same-origin memory without hidden cross-site tracking.
 */

export class ActivityTracker {
	constructor({ api, state }) {
		Object.assign(this, { api, state });
		this.startedAt = performance.now();
		this.current = null;
		this.visibleSince = document.visibilityState === 'visible'
			? performance.now()
			: 0;
		this.visibleDuration = 0;
	}

	initialize() {
		document.addEventListener('visibilitychange', () => this.visibilityChanged());
		window.addEventListener('pagehide', () => this.flushDuration());
	}

	async navigate(route, previous = '') {
		await this.flushDuration();
		this.current = {
			category: 'navigation',
			action: previous ? 'navigate' : 'view',
			title: route.title,
			path: `${location.pathname}${location.search}#${route.id}`,
			entity: { type: 'socialHubTab', id: route.id },
			visibility: { mode: 'private' }
		};
		this.startedAt = performance.now();
		this.visibleDuration = 0;
		this.visibleSince = document.visibilityState === 'visible'
			? performance.now()
			: 0;
		await this.record(this.current);
	}

	async social(event) {
		return this.record({
			visibility: { mode: 'private' },
			path: `${location.pathname}${location.search}${location.hash}`,
			...event
		});
	}

	visibilityChanged() {
		const now = performance.now();
		if (document.visibilityState === 'visible') {
			this.visibleSince = now;
			return;
		}
		if (this.visibleSince) this.visibleDuration += now - this.visibleSince;
		this.visibleSince = 0;
		void this.flushDuration();
	}

	async flushDuration() {
		if (!this.current) return null;
		const now = performance.now();
		const duration = this.visibleDuration
			+ (this.visibleSince ? now - this.visibleSince : 0);
		if (duration < 1000) return null;
		this.visibleDuration = 0;
		this.visibleSince = this.visibleSince ? now : 0;
		return this.record({
			...this.current,
			durationMs: Math.round(duration)
		});
	}

	async record(event) {
		const snapshot = this.state.snapshot();
		const aliasId = snapshot.identity.aliasId;
		if (!aliasId || snapshot.preferences?.enabled === false) return null;
		if (snapshot.preferences?.categories?.[event.category] === false) return null;
		try {
			return await this.api.recordActivity(aliasId, event);
		} catch (error) {
			console.warn('Private activity record was not saved:', error.message);
			return null;
		}
	}
}
