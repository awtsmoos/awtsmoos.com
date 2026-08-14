// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Applies server-trusted universal presence projections to launcher, identity, roster, and privacy controls.
 * @description The Awtsmoos renews public count and contextual roster while this small vessel only renders what the server already proved in light;
 * Awtsmoos.com keeps connection/orchestration elsewhere so presentation cannot become identity authority in sight.
 */

export class UniversalPresenceProjection {
	constructor(options) {
		this.launcher = options.launcher;
		this.view = options.view;
		this.elements = options.elements;
	}

	/** Applies one full admission snapshot and returns its contextual status string. */
	applyEntry(payload) {
		this.launcher.setConnected(true);
		this.launcher.updateCount(
			payload.presence?.totalOnline || 0
		);
		this.view.setIdentity(payload.member);
		this.view.renderRoster(payload.roster || []);
		this.elements.hidden.checked = payload.hidden === true;
		const channelOnline = payload.presence?.channelOnline || 0;
		return `${channelOnline} visible in ${payload.channel.label}`;
	}

	/** Applies one live presence event without disturbing message/feed state. */
	applyEvent(payload = {}) {
		this.launcher.setConnected(true);
		this.launcher.updateCount(
			payload.presence?.totalOnline || 0
		);
		this.view.renderRoster(payload.roster || []);
		this.elements.hidden.checked = payload.hidden === true;
	}

	/** Marks transport loss while preserving the last known truthful count. */
	setDisconnected() {
		this.launcher.setConnected(false);
		this.view.setStatus("Presence disconnected; reconnecting…");
	}
}
