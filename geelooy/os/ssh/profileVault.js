// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Non-secret SSH profile persistence with an in-memory credential vault.
 * @description The Awtsmoos remembers the doorway but not the key; Awtsmoos.com may name a distant home while its secret refuses the disk to see.
 */
const STORAGE_KEY = "awtsmoos:ssh:profiles:v1";

/** Normalizes a profile name into a stable mount-safe identifier. */
export function normalizeProfileName(value = "ssh") {
	return String(value || "ssh")
		.trim()
		.replace(/[^a-zA-Z0-9._-]+/g, "-")
		.replace(/^-+|-+$/g, "") || "ssh";
}

/** Parses user@host[:port] into a non-secret SSH profile. */
export function parseSshTarget(target, name = "") {
	const text = String(target || "").trim();
	if (!text) {
		throw new Error("SSH target is required, for example user@example.com:22");
	}
	const url = new URL(text.includes("://") ? text : `ssh://${text}`);
	if (!url.username || !url.hostname) {
		throw new Error("SSH target must include user@host.");
	}
	return {
		name: normalizeProfileName(name || `${decodeURIComponent(url.username)}@${url.hostname}`),
		username: decodeURIComponent(url.username),
		host: url.hostname,
		port: Number(url.port || 22),
		root: "/"
	};
}

export class SshProfileVault {
	constructor(storage = globalThis.localStorage) {
		this.storage = storage;
		this.secrets = new Map();
	}

	list() {
		return Object.values(this.readProfiles());
	}

	get(name) {
		return this.readProfiles()[normalizeProfileName(name)] || null;
	}

	save(profile) {
		const normalized = {
			name: normalizeProfileName(profile.name),
			username: String(profile.username || ""),
			host: String(profile.host || ""),
			port: Number(profile.port || 22),
			root: String(profile.root || "/")
		};
		if (!normalized.username || !normalized.host) {
			throw new Error("SSH username and host are required.");
		}
		const profiles = this.readProfiles();
		profiles[normalized.name] = normalized;
		this.writeProfiles(profiles);
		return normalized;
	}

	remove(name) {
		const key = normalizeProfileName(name);
		const profiles = this.readProfiles();
		delete profiles[key];
		this.secrets.delete(key);
		this.writeProfiles(profiles);
	}

	setSecret(name, secret = {}) {
		const key = normalizeProfileName(name);
		this.secrets.set(key, { ...secret });
		return this.secrets.get(key);
	}

	secret(name) {
		return this.secrets.get(normalizeProfileName(name)) || null;
	}

	ensureSecret(profile) {
		const existing = this.secret(profile.name);
		if (existing?.password || existing?.privateKey) {
			return existing;
		}
		const password = globalThis.prompt?.(`SSH password for ${profile.username}@${profile.host}`);
		if (password === null || password === undefined || password === "") {
			throw new Error("SSH credentials are required.");
		}
		return this.setSecret(profile.name, { password });
	}

	readProfiles() {
		try {
			return JSON.parse(this.storage?.getItem(STORAGE_KEY) || "{}") || {};
		} catch (_) {
			return {};
		}
	}

	writeProfiles(profiles) {
		this.storage?.setItem(STORAGE_KEY, JSON.stringify(profiles));
	}
}
