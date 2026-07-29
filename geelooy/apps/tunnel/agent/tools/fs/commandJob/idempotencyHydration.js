// B"H
const fs = require("node:fs/promises");
const path = require("node:path");
const Paths = require("./paths.js");
const Roots = require("./stateRoots.js");

const hydratedRoots = new Set();

/**
 * Rebuilds the in-memory idempotency index from bounded durable command metadata.
 * This happens once per state root after process birth, so a renewed agent joins
 * an existing job instead of starting the same command again.
 */
async function hydrate(config = {}, records, options = {}) {
	const discovery = Roots.discover(config, {
		maxRoots: positive(options.maxRoots, 32)
	});
	let loaded = 0;
	for (const root of discovery.roots) {
		const commandRoot = Paths.storeRoot(Roots.configForRoot(config, root.path));
		if (hydratedRoots.has(commandRoot)) continue;
		hydratedRoots.add(commandRoot);
		const names = await newestNames(commandRoot, positive(options.maxJobsPerRoot, 1000));
		for (const name of names) {
			const meta = await Paths.readJson(
				path.join(commandRoot, name, "meta.json"),
				null
			).catch(() => null);
			const key = String(meta?.idempotencyKey || "").trim();
			const hash = String(meta?.commandHash || "").trim();
			if (!key || !hash || records.has(key)) continue;
			records.set(key, {
				idempotencyKey: key,
				commandHash: hash,
				jobId: String(meta.jobId || name),
				state: String(meta.status || "accepted"),
				createdAt: meta.createdAt || meta.queuedAt || meta.startedAt || new Date().toISOString(),
				updatedAt: meta.updatedAt || meta.finishedAt || new Date().toISOString(),
				hydratedAfterRestart: true
			});
			loaded += 1;
		}
	}
	return { loaded, roots: discovery.roots.length };
}

async function newestNames(root, limit) {
	let entries;
	try {
		entries = await fs.readdir(root, { withFileTypes: true });
	} catch {
		return [];
	}
	const rows = await Promise.all(entries
		.filter(entry => entry.isDirectory())
		.map(async entry => {
			const full = path.join(root, entry.name);
			const stat = await fs.stat(full).catch(() => null);
			return { name: entry.name, mtimeMs: Number(stat?.mtimeMs || 0) };
		}));
	return rows.sort((a, b) => b.mtimeMs - a.mtimeMs)
		.slice(0, limit)
		.map(row => row.name);
}

function reset() {
	hydratedRoots.clear();
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? Math.floor(number) : fallback;
}

module.exports = { hydrate, newestNames, reset };
