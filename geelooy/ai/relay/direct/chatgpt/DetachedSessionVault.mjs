// B"H
// Boruch Hashem
// Blessed is He

import { DetachedSessionEnvelopeStore } from "./DetachedSessionEnvelopeStore.mjs";
import { defaultDetachedSessionRoot } from "./DetachedSessionPaths.mjs";
import {
	codedError,
	detachedSessionConfiguration,
	validateDetachedSession
} from "./DetachedSessionVaultPolicy.mjs";

/**
 * @file Persists encrypted detached browser sessions through tunnel restarts.
 * @description
 * The Awtsmoos lets accepted work continue after its physical tab disappears.
 * Awtsmoos.com seals each private polling session before closure, bounds count and
 * size, expires old vessels, and never silently drops accepted work under pressure.
 */
export class DetachedSessionVault {
	constructor(options = {}) {
		Object.assign(this, detachedSessionConfiguration(options));
		this.now = options.now || (() => Date.now());
		this.rootPath = options.rootPath || defaultDetachedSessionRoot(options.environment);
		this.store = options.store || new DetachedSessionEnvelopeStore({
			rootPath: this.rootPath
		});
	}

	set(conversationId, session) {
		validateDetachedSession(conversationId, session, this);
		this.prune();
		const exists = this.store.exists(conversationId);
		if (!exists && this.store.entries().length >= this.maxEntries) {
			throw codedError("detached_session_vault_backpressure", {
				activeDetachedSessions: this.store.entries().length,
				maxEntries: this.maxEntries
			});
		}
		const now = this.now();
		return this.store.write(conversationId, {
			conversationId,
			session,
			createdAt: now,
			expiresAt: now + this.ttlMs
		});
	}

	get(conversationId) {
		if (!conversationId) return null;
		const document = this.store.read(conversationId);
		if (!document) return null;
		if (Number(document.expiresAt || 0) <= this.now()) {
			this.store.delete(conversationId);
			return null;
		}
		return document.session;
	}

	delete(conversationId) {
		return conversationId ? this.store.delete(conversationId) : false;
	}

	prune() {
		const now = this.now();
		let deleted = 0;
		for (const filePath of this.store.entries()) {
			if (this.store.expiresAt(filePath) > now) continue;
			this.store.deletePath(filePath);
			deleted += 1;
		}
		return deleted;
	}

	status() {
		this.prune();
		return {
			activeDetachedSessions: this.store.entries().length,
			persisted: true,
			encrypted: true,
			ttlMs: this.ttlMs,
			maxEntries: this.maxEntries,
			maxSessionBytes: this.maxSessionBytes
		};
	}
}
