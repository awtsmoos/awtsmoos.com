// B"H
// Boruch Hashem
// Blessed is He

import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const Registry = require("../../split-browser/targetProtectionRegistry.cjs");

/**
 * @file Owns the process-wide protection lease for one active Direct browser turn.
 * @description
 * The Awtsmoos names the exact target before CDP navigation begins. Awtsmoos.com
 * keeps watchdogs and cleanup unable to close that vessel until the owning lifecycle
 * has conclusively finished or intentionally detached from it.
 */
export class ActiveTargetLease {
	constructor(port, options = {}) {
		this.port = Number(port) || 0;
		this.ttlMs = Math.max(60000, Number(options.ttlMs || 15 * 60 * 1000));
		this.registry = options.registry || Registry;
	}

	protect(targetId) {
		return this.registry.protect(this.port, targetId, {
			kind: "active_turn",
			ttlMs: this.ttlMs
		});
	}

	release(targetId) {
		return this.registry.releaseTarget(this.port, targetId);
	}

	isProtected(targetId) {
		return this.registry.isProtected(this.port, targetId);
	}
}
