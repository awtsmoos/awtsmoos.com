// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

/**
 * @file Grants one process-safe recovery actor a short exact-generation lease.
 * @description
 * The Awtsmoos is One, so two swords never claim one healing instant at once;
 * Awtsmoos.com uses atomic directories and stale renames to make every competing actor renounce.
 */
function create(options = {}) {
	const now = options.now || Date.now;
	const leaseMs = bounded(options.leaseMs, 15000);
	const lockDir = path.join(options.recoveryRoot, "state", "recovery-control.lock");

	function claim(details = {}) {
		fs.mkdirSync(path.dirname(lockDir), { recursive: true, mode: 0o700 });
		const existing = readLease(lockDir);
		if (existing && Number(existing.expiresAt || 0) > now()) {
			return { ok: false, error: "recovery_control_busy", lease: publicLease(existing) };
		}
		if (fs.existsSync(lockDir) && !retireStale(lockDir, now)) {
			return { ok: false, error: "recovery_control_busy" };
		}
		try {
			fs.mkdirSync(lockDir, { mode: 0o700 });
		} catch {
			return { ok: false, error: "recovery_control_busy" };
		}
		const acquiredAt = now();
		const lease = {
			token: crypto.randomUUID(),
			actor: clean(details.actor || `pid:${process.pid}`),
			action: clean(details.action),
			generation: positive(details.generation),
			acquiredAt,
			expiresAt: acquiredAt + leaseMs
		};
		writeLease(lockDir, lease);
		return { ok: true, lease: { ...lease } };
	}

	return { claim, lockDir };
}

function retireStale(lockDir, now) {
	const stale = `${lockDir}.stale-${process.pid}-${now()}-${crypto.randomUUID()}`;
	try {
		fs.renameSync(lockDir, stale);
		fs.rmSync(stale, { recursive: true, force: true });
		return true;
	} catch {
		return false;
	}
}

function readLease(lockDir) {
	try {
		return JSON.parse(fs.readFileSync(path.join(lockDir, "lease.json"), "utf8"));
	} catch {
		return null;
	}
}

function writeLease(lockDir, lease) {
	fs.writeFileSync(path.join(lockDir, "lease.json"), `${JSON.stringify(lease, null, 2)}\n`, {
		mode: 0o600
	});
}

function publicLease(value = {}) {
	return {
		action: clean(value.action),
		generation: positive(value.generation),
		acquiredAt: Number(value.acquiredAt || 0),
		expiresAt: Number(value.expiresAt || 0)
	};
}

function bounded(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) ? Math.max(5000, Math.min(60000, number)) : fallback;
}

function positive(value) {
	const number = Number(value);
	return Number.isInteger(number) && number > 0 ? number : 0;
}

function clean(value) {
	return String(value || "").slice(0, 120);
}

module.exports = { bounded, create, publicLease };
