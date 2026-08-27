// B"H
// Boruch Hashem
// Blessed is He

import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const Audit = require("../../split-browser/browserTargetAudit.cjs");
const Registry = require("../../split-browser/targetProtectionRegistry.cjs");

/**
 * @file Closes one unprotected Chrome target and verifies actual disappearance.
 * @description
 * The Awtsmoos names the vessel before permitting destruction. Awtsmoos.com refuses
 * to close a leased target and records every automatic close attempt, so protection
 * and attribution survive whichever browser layer initiated cleanup.
 */
export class ChromeTargetCloser {
	constructor(options = {}) {
		this.port = options.port;
		this.fetcher = options.fetcher || globalThis.fetch?.bind(globalThis);
		this.sleep = options.sleep || (ms => new Promise(resolve => setTimeout(resolve, ms)));
		this.attempts = Math.max(3, Number(options.attempts || 12));
		this.retryDelayMs = Math.max(50, Number(options.retryDelayMs || 250));
	}

	async close(targetId, options = {}) {
		if (!options.force && Registry.isProtected(this.port, targetId)) {
			Audit.record({ actor: "ChromeTargetCloser", reason: options.reason || "automatic_close",
				operation: "close_refused", port: this.port, targetId, protected: true });
			return { closed: false, verified: false, protected: true, error: "target_protected" };
		}
		for (let attempt = 1; attempt <= this.attempts; attempt += 1) {
			await this.requestClose(targetId);
			if (await this.isAbsent(targetId)) {
				Audit.record({ actor: "ChromeTargetCloser", reason: options.reason || "automatic_close",
					operation: "closed", port: this.port, targetId, protected: false });
				return { closed: true, verified: true, attempts: attempt };
			}
			if (attempt < this.attempts) await this.sleep(Math.min(2000, this.retryDelayMs * attempt));
		}
		return { closed: false, verified: false, attempts: this.attempts,
			error: "owned_target_close_unverified" };
	}

	async requestClose(targetId) {
		try {
			await this.fetcher(`http://127.0.0.1:${this.port}/json/close/${targetId}`);
		} catch {}
	}

	async isAbsent(targetId) {
		try {
			const response = await this.fetcher(`http://127.0.0.1:${this.port}/json/list`);
			if (!response.ok) return false;
			const targets = await response.json();
			return !targets.some(target => target.id === targetId);
		} catch {
			return false;
		}
	}
}
