// B"H
// Boruch Hashem
// Blessed is He

import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { defaultQueueRoot } from "./GlobalWebsiteQueuePaths.mjs";

/**
 * @file Persists one cross-process website-agent queue behind an atomic lock.
 * @description
 * The Awtsmoos renews every worker without multiplying authority. Awtsmoos.com
 * keeps tickets and leases outside replaceable runtime, cleans dead vessels, and
 * writes each state transition atomically so separate workers share one truth.
 */
export class GlobalWebsiteQueueStore {
	constructor(options = {}) {
		this.rootPath = options.rootPath || defaultQueueRoot();
		this.statePath = path.join(this.rootPath, "state.json");
		this.lockPath = path.join(this.rootPath, "state.lock");
		this.now = options.now || (() => Date.now());
		this.sleep = options.sleep || delay;
		this.pollMs = Math.max(5, Number(options.pollMs || 100));
		this.lockStaleMs = Math.max(1000, Number(options.lockStaleMs || 30000));
		this.leaseStaleMs = Math.max(60000, Number(options.leaseStaleMs || 600000));
		fs.mkdirSync(this.rootPath, { recursive: true, mode: 0o700 });
	}

	async mutate(mutator) {
		await this.acquireLock();
		try {
			const state = this.clean(this.read());
			const result = await mutator(state);
			this.write(state);
			return result;
		} finally {
			fs.rmSync(this.lockPath, { recursive: true, force: true });
		}
	}

	read() {
		try {
			const value = JSON.parse(fs.readFileSync(this.statePath, "utf8"));
			return value?.schemaVersion === 1 ? value : initialState();
		} catch {
			return initialState();
		}
	}

	write(state) {
		const temporary = `${this.statePath}.tmp-${process.pid}-${randomUUID()}`;
		fs.writeFileSync(temporary, `${JSON.stringify(state, null, 2)}\n`, {
			encoding: "utf8",
			mode: 0o600
		});
		fs.renameSync(temporary, this.statePath);
	}

	clean(state) {
		const now = this.now();
		state.queue = Array.isArray(state.queue)
			? state.queue.filter(ticket => this.processAlive(ticket.pid))
			: [];
		state.active = Array.isArray(state.active)
			? state.active.filter(lease => this.processAlive(lease.pid) &&
				now - Number(lease.acquiredAt || 0) < this.leaseStaleMs)
			: [];
		state.lastLaunchAt = Number(state.lastLaunchAt || 0) || null;
		state.updatedAt = new Date(now).toISOString();
		return state;
	}

	async acquireLock() {
		for (;;) {
			try {
				fs.mkdirSync(this.lockPath);
				fs.writeFileSync(path.join(this.lockPath, "owner.json"),
					JSON.stringify({ pid: process.pid, at: this.now() }));
				return;
			} catch (error) {
				if (error.code !== "EEXIST") throw error;
				if (this.lockIsStale()) {
					fs.rmSync(this.lockPath, { recursive: true, force: true });
				} else {
					await this.sleep(this.pollMs);
				}
			}
		}
	}

	lockIsStale() {
		try { return this.now() - fs.statSync(this.lockPath).mtimeMs > this.lockStaleMs; }
		catch { return true; }
	}

	processAlive(pid) {
		try { process.kill(Number(pid), 0); return true; }
		catch (error) { return error.code === "EPERM"; }
	}
}

function initialState() {
	return { schemaVersion: 1, queue: [], active: [], lastLaunchAt: null, updatedAt: null };
}

function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}
