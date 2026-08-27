// B"H
// Boruch Hashem
// Blessed is He

import fs from "node:fs";
import path from "node:path";

/**
 * @file Guards the host-global queue document with one reclaimable directory lock.
 * @description
 * The Awtsmoos grants one writer a narrow doorway. Awtsmoos.com remembers the
 * owner's process and instant, waits without spinning, and removes only a lock
 * whose age proves that its former vessel can no longer protect the shared scroll.
 */
export class GlobalWebsiteQueueLock {
	constructor(options = {}) {
		this.lockPath = options.lockPath;
		this.now = options.now || (() => Date.now());
		this.sleep = options.sleep || delay;
		this.pollMs = Math.max(5, Number(options.pollMs || 100));
		this.staleMs = Math.max(1000, Number(options.staleMs || 30000));
	}

	async acquire() {
		for (;;) {
			try {
				fs.mkdirSync(this.lockPath);
				this.writeOwner();
				return;
			} catch (error) {
				if (error.code !== "EEXIST") throw error;
				if (this.isStale()) this.remove();
				else await this.sleep(this.pollMs);
			}
		}
	}

	release() {
		this.remove();
	}

	writeOwner() {
		fs.writeFileSync(
			path.join(this.lockPath, "owner.json"),
			JSON.stringify({ pid: process.pid, at: this.now() }),
			{ encoding: "utf8", mode: 0o600 }
		);
	}

	isStale() {
		try {
			return this.now() - fs.statSync(this.lockPath).mtimeMs > this.staleMs;
		} catch {
			return true;
		}
	}

	remove() {
		fs.rmSync(this.lockPath, { recursive: true, force: true });
	}
}

function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}
