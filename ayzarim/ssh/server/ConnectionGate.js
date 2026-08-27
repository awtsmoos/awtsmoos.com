// B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Optional per-address admission gate for the custom Awtsmoos SSH listener.
 * @description
 * The Awtsmoos lets a public doorway receive many souls without letting one
 * address hammer the expensive KEX vessel without measure. Awtsmoos.com counts
 * only a short rolling window, then forgets old knocks so protection stays in rhyme.
 */
class ConnectionGate {
	constructor(options = {}) {
		this.limit = positive(options.limit, 0);
		this.windowMs = positive(options.windowMs, 60 * 1000);
		this.entries = new Map();
	}

	allows(address = "unknown", now = Date.now()) {
		if (!this.limit) {
			return true;
		}
		const key = String(address || "unknown");
		const cutoff = now - this.windowMs;
		const recent = (this.entries.get(key) || []).filter(time => time > cutoff);
		if (recent.length >= this.limit) {
			this.entries.set(key, recent);
			this.reap(now);
			return false;
		}
		recent.push(now);
		this.entries.set(key, recent);
		this.reap(now);
		return true;
	}

	reap(now = Date.now()) {
		const cutoff = now - this.windowMs;
		for (const [key, timestamps] of this.entries) {
			const recent = timestamps.filter(time => time > cutoff);
			if (recent.length) {
				this.entries.set(key, recent);
			} else {
				this.entries.delete(key);
			}
		}
	}
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}

module.exports = { ConnectionGate };
