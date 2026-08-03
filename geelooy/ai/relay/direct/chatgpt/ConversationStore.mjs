//B"H
// Boruch Hashem
// Blessed is He

import { randomUUID } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

/**
 * ChatGPT identifiers remain behind the local relay gate. The Awtsmoos joins each
 * continuation in memory, while Awtsmoos.com returns only an opaque local key
 * that cannot reveal the upstream conversation or assistant message identity.
 */
export class ConversationStore {
	constructor({
		ttlMs = 1000 * 60 * 60 * 24 * 7,
		maximumEntries = 500,
		storagePath = defaultStoragePath()
	} = {}) {
		this.ttlMs = ttlMs;
		this.maximumEntries = maximumEntries;
		this.storagePath = storagePath === false ? null : storagePath;
		this.entries = new Map();
		this.ensurePrivateDirectory();
		this.load();
	}

	create(state) {
		this.prune();
		const key = `BH_DIRECT_${randomUUID()}`;
		this.entries.set(key, {
			state,
			createdAt: Date.now(),
			touchedAt: Date.now()
		});
		this.persist();
		return key;
	}

	get(key) {
		if (!key) return null;
		const entry = this.entries.get(key);
		if (!entry) return null;
		if (Date.now() - entry.touchedAt > this.ttlMs) {
			this.entries.delete(key);
			this.persist();
			return null;
		}
		entry.touchedAt = Date.now();
		this.persist();
		return entry.state;
	}

	set(key, state) {
		if (!key || !this.entries.has(key)) {
			return this.create(state);
		}
		const entry = this.entries.get(key);
		entry.state = state;
		entry.touchedAt = Date.now();
		this.persist();
		return key;
	}

	delete(key) {
		const removed = this.entries.delete(key);
		if (removed) this.persist();
		return removed;
	}

	clear() {
		const count = this.entries.size;
		this.entries.clear();
		this.persist();
		return count;
	}

	status() {
		this.prune();
		return {
			activeConversations: this.entries.size,
			ttlMs: this.ttlMs,
			maximumEntries: this.maximumEntries
		};
	}

	prune() {
		const now = Date.now();
		for (const [key, entry] of this.entries) {
			if (now - entry.touchedAt > this.ttlMs) this.entries.delete(key);
		}
		while (this.entries.size >= this.maximumEntries) {
			const oldest = [...this.entries.entries()]
				.sort((left, right) => left[1].touchedAt - right[1].touchedAt)[0];
			if (!oldest) break;
			this.entries.delete(oldest[0]);
		}
	}

	load() {
		if (!this.storagePath) return;
		try {
			const document = JSON.parse(fs.readFileSync(this.storagePath, "utf8"));
			if (document?.schemaVersion !== 1 || !Array.isArray(document.entries)) return;
			for (const [key, entry] of document.entries) {
				if (!String(key || "").startsWith("BH_DIRECT_")) continue;
				if (!entry?.state || !Number.isFinite(Number(entry.touchedAt))) continue;
				this.entries.set(key, entry);
			}
			this.prune();
		} catch {}
	}

	persist() {
		if (!this.storagePath) return;
		const directory = this.ensurePrivateDirectory();
		const temporary = `${this.storagePath}.tmp-${process.pid}-${randomUUID()}`;
		try {
			fs.writeFileSync(temporary, `${JSON.stringify({
				schemaVersion: 1,
				updatedAt: new Date().toISOString(),
				entries: [...this.entries.entries()]
			}, null, 2)}\n`, { encoding: "utf8", mode: 0o600 });
			fs.renameSync(temporary, this.storagePath);
			fs.chmodSync(this.storagePath, 0o600);
		} catch {
			try { fs.unlinkSync(temporary); } catch {}
		}
	}

	ensurePrivateDirectory() {
		if (!this.storagePath) return null;
		const directory = path.dirname(this.storagePath);
		fs.mkdirSync(directory, { recursive: true, mode: 0o700 });
		fs.chmodSync(directory, 0o700);
		return directory;
	}
}

function defaultStoragePath() {
	const root = process.env.AWTSMOOS_INSTALL_ROOT
		|| path.join(os.homedir(), ".awtsmoos-tunnel");
	return path.join(root, "private", "chatgpt-conversations.json");
}
