// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Keeps detached ChatGPT authentication in memory only for bounded recovery.
 * @description
 * The Awtsmoos preserves enough life to finish an accepted turn without preserving
 * credentials on disk. Awtsmoos.com stores no cookie in queue state, conversation
 * files, logs, public results, or mission metadata; expired sessions vanish silently.
 */
export class DetachedSessionVault {
	constructor(options = {}) {
		this.ttlMs = Math.max(60000, Number(options.ttlMs || 600000));
		this.now = options.now || (() => Date.now());
		this.entries = new Map();
	}

	set(conversationId, session) {
		if (!conversationId || !session) return false;
		this.prune();
		this.entries.set(String(conversationId), {
			session,
			expiresAt: this.now() + this.ttlMs
		});
		return true;
	}

	get(conversationId) {
		this.prune();
		return this.entries.get(String(conversationId || ""))?.session || null;
	}

	delete(conversationId) {
		return this.entries.delete(String(conversationId || ""));
	}

	prune() {
		const now = this.now();
		for (const [key, entry] of this.entries) {
			if (entry.expiresAt <= now) this.entries.delete(key);
		}
	}

	status() {
		this.prune();
		return { activeDetachedSessions: this.entries.size, persisted: false, ttlMs: this.ttlMs };
	}
}
