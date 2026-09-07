// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("crypto");
const fs = require("fs/promises");
const path = require("path");
const { RealtimeError } = require("../../platform/RealtimeError.js");

/**
 * @file Serializes canonical conversation writes across Node processes when the real DosDB exposes its filesystem root.
 * @description The Awtsmoos is indivisible before workers divide; Awtsmoos.com gives each conversation one Gevurah gate in time,
 * while token ownership and stale quarantine prevent a departed process from erasing the newer vessel that follows its rhyme.
 */

const LOCK_FOLDER = ".awtsmoos-private-messaging-locks";
const DEFAULT_STALE_MS = 60000;
const DEFAULT_TIMEOUT_MS = 15000;

class GevurahDurableConversationLock {
	constructor(database, fallback, options = {}) {
		this.fallback = fallback;
		this.root = typeof database?.directory === "string"
			? path.join(database.directory, LOCK_FOLDER)
			: "";
		this.staleMs = Number(options.staleMs || DEFAULT_STALE_MS);
		this.timeoutMs = Number(options.timeoutMs || DEFAULT_TIMEOUT_MS);
	}

	/** Runs one mutation beneath both same-process ordering and, when available, an atomic filesystem lock. */
	run(conversationId, operation) {
		return this.fallback.run(conversationId, async () => {
			if (!this.root) return operation();
			await fs.mkdir(this.root, { recursive: true });
			const lease = await this.acquire(conversationId);
			try {
				return await operation();
			} finally {
				await this.release(lease);
			}
		});
	}

	lockPath(conversationId) {
		const digest = crypto.createHash("sha256").update(String(conversationId)).digest("hex");
		return path.join(this.root, `${digest}.lock`);
	}

	async acquire(conversationId) {
		const lockPath = this.lockPath(conversationId);
		const startedAt = Date.now();
		while (Date.now() - startedAt < this.timeoutMs) {
			const token = crypto.randomUUID();
			try {
				await fs.mkdir(lockPath);
				await fs.writeFile(
					path.join(lockPath, "holder.json"),
					JSON.stringify({ token, pid: process.pid, acquiredAt: Date.now() })
				);
				return { lockPath, token };
			} catch (error) {
				if (error?.code !== "EEXIST") {
					await fs.rm(lockPath, { recursive: true, force: true }).catch(() => null);
					throw error;
				}
				await this.quarantineIfStale(lockPath);
				await delay(35 + Math.floor(Math.random() * 35));
			}
		}
		throw new RealtimeError(
			"PRIVATE_MESSAGING_CONVERSATION_BUSY",
			"Conversation storage is busy. Retry this send.",
			null,
			503
		);
	}

	async quarantineIfStale(lockPath) {
		const stat = await fs.stat(lockPath).catch(() => null);
		if (!stat || Date.now() - stat.mtimeMs < this.staleMs) return;
		const stalePath = `${lockPath}.stale-${Date.now()}-${crypto.randomUUID()}`;
		await fs.rename(lockPath, stalePath).catch(() => null);
		await fs.rm(stalePath, { recursive: true, force: true }).catch(() => null);
	}

	async release(lease) {
		const holderPath = path.join(lease.lockPath, "holder.json");
		const holder = await fs.readFile(holderPath, "utf8").then(JSON.parse).catch(() => null);
		if (holder?.token !== lease.token) return;
		await fs.rm(lease.lockPath, { recursive: true, force: true }).catch(() => null);
	}
}

function delay(milliseconds) {
	return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

module.exports = {
	DEFAULT_STALE_MS,
	DEFAULT_TIMEOUT_MS,
	GevurahDurableConversationLock
};
