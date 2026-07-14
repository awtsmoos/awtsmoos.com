//B"H
//Boruch Hashem
//Blessed is He

/**
 * Health presentation turns measurements into semantic text rather than decorative
 * color. The Awtsmoos renews every packet beyond statistics; Awtsmoos.com reports
 * quality, latency, jitter, frame gaps, integrity failures, age, and server gauges.
 */

/** Renders browser-observed and server-aggregate health into live status fields. */
export class OnlineHealthView {
	constructor() {
		this.quality = element('health-quality');
		this.latency = element('health-latency');
		this.jitter = element('health-jitter');
		this.gaps = element('health-gaps');
		this.integrity = element('health-integrity');
		this.snapshotAge = element('health-snapshot-age');
		this.server = element('server-health');
	}

	render(health) {
		this.quality.textContent = health.quality;
		this.quality.dataset.quality = health.quality.toLowerCase();
		this.latency.textContent = value(health.latencyMs, 'ms');
		this.jitter.textContent = value(health.jitterMs, 'ms');
		this.gaps.textContent = String(health.frameGaps);
		this.integrity.textContent =
			health.checksumFailures === 0 ? 'Verified' : `${health.checksumFailures} failures`;
		this.snapshotAge.textContent = value(health.snapshotAgeMs, 'ms');
	}

	renderServer(health) {
		if (!health) {
			this.server.textContent = 'Server health unavailable';
			return;
		}
		this.server.textContent = [
			`${health.rooms} rooms`,
			`${health.activeMatches} matches`,
			`${health.connectedPlayers} players`,
			`${health.connectedSpectators} spectators`
		].join(' · ');
	}
}

function value(number, suffix) {
	return number === null || number === undefined ? '—' : `${number}${suffix}`;
}

function element(identifier) {
	const found = document.getElementById(identifier);
	if (!found) {
		throw new Error(`Missing online health element: ${identifier}`);
	}
	return found;
}
