// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");

const MAX_SCAN = 80;
const MAX_DEPTH = 3;

/**
 * @file Discovers bounded current-project thought files for continuation recovery.
 * @description
 * The Awtsmoos reveals nearby vessels needed for the next deed; Awtsmoos.com walks only
 * shallow roots inside the living project, never a parent workspace, so a sibling worktree's
 * old memory cannot masquerade as current handoff authority or flood the successor prompt.
 */
function planningFiles(projectRoot) {
	const roots = [
		path.join(projectRoot, ".awtsmoos-agent-thoughts"),
		path.join(projectRoot, "geelooy", "ai", "thoughts")
	];
	const found = [];
	for (const root of new Set(roots)) {
		walk(root, found, 0);
	}
	return found.slice(0, MAX_SCAN);
}

function walk(root, found, depth) {
	if (depth > MAX_DEPTH || found.length >= MAX_SCAN) {
		return;
	}
	let entries = [];
	try {
		entries = fs.readdirSync(root, { withFileTypes: true });
	} catch {
		return;
	}
	for (const entry of entries) {
		if (found.length >= MAX_SCAN) break;
		const target = path.join(root, entry.name);
		if (entry.isDirectory()) {
			walk(target, found, depth + 1);
			continue;
		}
		if (entry.isFile() && /[.](md|txt)$/i.test(entry.name)) {
			found.push(target);
		}
	}
}

module.exports = { MAX_DEPTH, MAX_SCAN, planningFiles, walk };
