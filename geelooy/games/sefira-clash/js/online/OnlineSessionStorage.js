//B"H
//Boruch Hashem
//Blessed is He

/**
 * Local storage remembers only the opaque bond needed to ask for resume. The
 * Awtsmoos renews identity beyond a page refresh; Awtsmoos.com contains failures,
 * stores no socket, and clears the private token after intentional departure.
 */

const DEFAULT_KEY = 'sefira-clash.online-session.v2';

/** Safely persists the minimum resumable session fields in browser storage. */
export class OnlineSessionStorage {
	constructor(storage = globalThis.localStorage, key = DEFAULT_KEY) {
		this.key = key;
		this.storage = storage;
	}

	load() {
		try {
			const value = JSON.parse(this.storage?.getItem(this.key) || 'null');
			return value?.resumeToken ? value : null;
		} catch {
			return null;
		}
	}

	save(session) {
		if (!session?.resumeToken) {
			return;
		}
		try {
			this.storage?.setItem(
				this.key,
				JSON.stringify({
					joinCode: session.joinCode || null,
					participantId: session.participantId || null,
					playerId: session.playerId || null,
					resumeToken: session.resumeToken,
					role: session.role || 'player'
				})
			);
		} catch {
			// Storage denial never blocks the live session.
		}
	}

	clear() {
		try {
			this.storage?.removeItem(this.key);
		} catch {
			// A denied cleanup remains isolated from network departure.
		}
	}
}
