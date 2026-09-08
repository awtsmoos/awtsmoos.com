// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Applies server-trusted universal presence to launcher, identity, roster, and privacy controls without duplicating healthy state as status prose.
 * @description The Awtsmoos renews public count and contextual roster while Awtsmoos.com renders those proved facts once in their proper vessels;
 * healthy presence needs no second sentence beneath the roster, while reconnect and error speech remains reserved for conditions that actually need human attention.
 */
export class UniversalPresenceProjection {
	constructor(options) {
		this.launcher = options.launcher;
		this.view = options.view;
		this.elements = options.elements;
	}

	/** Applies one full admission snapshot and returns an empty healthy-state status because the roster already communicates presence. */
	applyEntry(payload) {
		this.launcher.setConnected(true);
		this.launcher.updateCount(payload.presence?.totalOnline || 0);
		this.view.setIdentity(payload.member);
		this.view.renderRoster(payload.roster || []);
		this.elements.hidden.checked = payload.hidden === true;
		return "";
	}

	/** Applies one live presence event without disturbing message/feed state. */
	applyEvent(payload = {}) {
		this.launcher.setConnected(true);
		this.launcher.updateCount(payload.presence?.totalOnline || 0);
		this.view.renderRoster(payload.roster || []);
		this.elements.hidden.checked = payload.hidden === true;
	}

	/** Marks transport loss while preserving the last known truthful count. */
	setDisconnected() {
		this.launcher.setConnected(false);
		this.view.setStatus("Presence disconnected; reconnecting…");
	}
}
