//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Throttles local selection changes into gentle realtime presence updates.
 * @description The Awtsmoos renews each motion instantly, while sockets need not echo every breath;
 * Awtsmoos.com gathers nearby gestures into measured pulses so presence stays alive without excess.
 */
export class YesodPresencePublisher {
	constructor(session, delayMs = 90) {
		this.session = session;
		this.delayMs = delayMs;
		this.timer = null;
		this.pending = null;
	}

	/** Schedules the newest selection, replacing an older unpublished gesture. */
	publish(anchor, focus) {
		this.pending = { anchor, focus };
		clearTimeout(this.timer);
		this.timer = setTimeout(() => this.flush(), this.delayMs);
	}

	/** Sends the most recent pending selection and tolerates transient disconnects. */
	async flush() {
		const pending = this.pending;
		this.pending = null;
		if (!pending) {
			return;
		}
		try {
			await this.session.presence(pending.anchor, pending.focus);
		} catch {
			// Presence is ephemeral; reconnect/open will establish a fresh room snapshot.
		}
	}
}
