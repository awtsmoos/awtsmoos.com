// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module CleanupDerivedArtifacts
 * @description
 * Deletes only explicit top-level build/audit families after age and recursive
 * open-handle checks. Canonical databases, active sidecars, models, and unknown
 * names remain protected by default.
 */

const fs = require('fs');
const path = require('path');
const { openHandles } = require('./exclusive.js');
const {
	allocatedBytes,
	readJson,
	recursiveTargets
} = require('./derivedSupport.js');

const DERIVED_PATTERNS = [
	/^all_remaining_.*_archived_/,
	/^audit_/,
	/^clean_/,
	/^comment_extensionless_migrate_/,
	/^import_/,
	/^known_comment_extensionless_/,
	/^likkutei_comment_migrate_/,
	/^likkutei-v\d+-v\d+-(?:fast-token|llama|multiprocess)-work$/,
	/^likkutei-v\d+-v\d+-fast-index$/,
	/^meluket_to_comment_tree_/,
	/^meluket-english-comments-embedding-job$/,
	/^mv_imported_/,
	/^recover_/,
	/^remaining_sidecars_/,
	/^repair_/,
	/^sefer-hasichos-english-comments-embedding-job$/,
	/^verify_/
];

const PROTECTED_NAMES = new Set([
	'embedder-lab',
	'models',
	'meluket-english-comments-rag.awtsdb',
	'sefer-hasichos-english-comments-rag.awtsdb'
]);

function activeNames(ragRoot) {
	const names = new Set(PROTECTED_NAMES);
	for (const name of fs.readdirSync(ragRoot)) {
		if (!name.endsWith('.fast-manifest.json')) continue;
		names.add(name);
		collectPaths(readJson(path.join(ragRoot, name)), ragRoot, names);
	}
	return names;
}

function collectPaths(value, ragRoot, names) {
	if (typeof value === 'string') {
		const resolved = path.resolve(value);
		if (resolved.startsWith(`${path.resolve(ragRoot)}${path.sep}`)) {
			names.add(path.basename(resolved));
		}
		return;
	}
	if (Array.isArray(value)) {
		for (const child of value) collectPaths(child, ragRoot, names);
		return;
	}
	if (value && typeof value === 'object') {
		for (const child of Object.values(value)) collectPaths(child, ragRoot, names);
	}
}

function cleanupDerived(policy, options = {}) {
	const protectedNames = activeNames(policy.ragRoot);
	const now = Number(options.now ?? Date.now());
	const removed = [];
	const preserved = [];
	for (const entry of fs.readdirSync(policy.ragRoot, { withFileTypes: true })) {
		const target = path.join(policy.ragRoot, entry.name);
		if (protectedNames.has(entry.name) || !allowed(entry.name, entry.isDirectory())) {
			preserved.push({ name: entry.name, reason: 'protected-or-unknown' });
			continue;
		}
		const status = fs.statSync(target);
		if (now - status.mtimeMs < policy.minimumMaintenanceAgeMs) {
			preserved.push({ name: entry.name, reason: 'too-new' });
			continue;
		}
		const handles = openHandles(recursiveTargets(target));
		if (handles.length) {
			preserved.push({ name: entry.name, reason: 'open-handles', handles });
			continue;
		}
		const bytes = allocatedBytes(target);
		if (options.dryRun !== true) {
			fs.rmSync(target, { recursive: true, force: true });
		}
		removed.push({ name: entry.name, bytes, dryRun: options.dryRun === true });
	}
	return { removed, preserved };
}

function allowed(name, isDirectory) {
	if (isDirectory) return DERIVED_PATTERNS.some(pattern => pattern.test(name));
	return /(?:\.log|\.before_[^.]+\.js|rag-progress\.json|sidecars_.*\.txt)$/i.test(name);
}

module.exports = {
	DERIVED_PATTERNS,
	PROTECTED_NAMES,
	activeNames,
	cleanupDerived
};