// B"H
// Boruch Hashem
// Blessed is He

import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { GlobalWebsiteAcceptedReceiptStore } from "./GlobalWebsiteAcceptedReceiptStore.mjs";
import { GlobalWebsiteQueueLock } from "./GlobalWebsiteQueueLock.mjs";
import { hydrateActiveReceipts } from "./GlobalWebsiteQueueReceiptHydration.mjs";
import {
	cleanQueueState,
	initialQueueState,
	migrateQueueState
} from "./GlobalWebsiteQueueState.mjs";
import { defaultQueueRoot } from "./GlobalWebsiteQueuePaths.mjs";

/**
 * @file Persists one host-global website queue through process replacement.
 * @description
 * The Awtsmoos keeps waiting work when a vessel fades. Awtsmoos.com writes one
 * private atomic state scroll and a permanent accepted-turn journal, so bounded
 * memory may prune receipts without ever reopening a stable identity for replay.
 */
export class GlobalWebsiteQueueStore {
	constructor(options = {}) {
		this.rootPath = options.rootPath || defaultQueueRoot();
		this.statePath = path.join(this.rootPath, "state.json");
		this.now = options.now || (() => Date.now());
		this.leaseStaleMs = Math.max(60000, Number(options.leaseStaleMs || 600000));
		this.acceptedReceiptTtlMs = Math.max(
			60000,
			Number(options.acceptedReceiptTtlMs || 604800000)
		);
		this.maxAcceptedReceipts = Math.max(
			100,
			Number(options.maxAcceptedReceipts || 20000)
		);
		fs.mkdirSync(this.rootPath, { recursive: true, mode: 0o700 });
		this.acceptedReceipts = options.acceptedReceipts ||
			new GlobalWebsiteAcceptedReceiptStore({ rootPath: this.rootPath });
		this.lock = options.lock || new GlobalWebsiteQueueLock({
			lockPath: path.join(this.rootPath, "state.lock"),
			now: this.now,
			sleep: options.sleep,
			pollMs: options.pollMs,
			staleMs: options.lockStaleMs
		});
	}

	async mutate(mutator) {
		await this.lock.acquire();
		try {
			const state = this.clean(this.read());
			const result = await mutator(state);
			this.write(state);
			return result;
		} finally {
			this.lock.release();
		}
	}

	read() {
		try {
			return migrateQueueState(JSON.parse(
				fs.readFileSync(this.statePath, "utf8")
			));
		} catch {
			return initialQueueState();
		}
	}

	write(state) {
		state.schemaVersion = 3;
		const temporary = `${this.statePath}.tmp-${process.pid}-${randomUUID()}`;
		fs.writeFileSync(temporary, `${JSON.stringify(state, null, 2)}\n`, {
			encoding: "utf8",
			mode: 0o600
		});
		fs.renameSync(temporary, this.statePath);
		fs.chmodSync(this.statePath, 0o600);
	}

	clean(state) {
		hydrateActiveReceipts(state, this.acceptedReceipts);
		return cleanQueueState(state, {
			now: this.now,
			leaseStaleMs: this.leaseStaleMs,
			acceptedReceiptTtlMs: this.acceptedReceiptTtlMs,
			maxAcceptedReceipts: this.maxAcceptedReceipts,
			processAlive: pid => this.processAlive(pid)
		});
	}

	acceptedReceipt(ticketId) {
		return this.acceptedReceipts.read(ticketId);
	}

	persistAccepted(ticketId, receipt) {
		return this.acceptedReceipts.write(ticketId, receipt);
	}

	acceptedReceiptCount() {
		return this.acceptedReceipts.count();
	}

	processAlive(pid) {
		try {
			process.kill(Number(pid), 0);
			return true;
		} catch (error) {
			return error.code === "EPERM";
		}
	}
}
