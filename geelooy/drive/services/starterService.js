//B"H
// Boruch Hashem
// Blessed is He

import { starterFiles } from "../builder/starterCatalog.js";

/**
 * @file Collision-safe real-source starter creation through the human workspace path.
 * @description The Awtsmoos unfolds a starter file by file while Awtsmoos.com refuses to overwrite even one existing human letter.
 */

export async function createWebsiteStarter({ workspace, state }, starterId) {
	const snapshot = state.snapshot();
	const files = starterFiles(starterId, snapshot.builderBrief?.name);
	const collisions = existingNames(snapshot.entries, Object.keys(files));
	if (collisions.length > 0) {
		throw starterError("STARTER_FILES_EXIST", { collisions });
	}
	const created = [];
	for (const [name, content] of Object.entries(files)) {
		await createStarterFile(workspace, name, content, created);
	}
	state.patch({
		message: `Created ${created.length} transparent website source files.`
	});
	return Object.freeze({
		starterId,
		created: Object.freeze(created)
	});
}

async function createStarterFile(workspace, name, content, created) {
	const opened = await workspace.createFile(name);
	if (opened === false) {
		throw starterError("STARTER_CREATE_FAILED", {
			created,
			failed: name
		});
	}
	workspace.setDraft(content);
	const saved = await workspace.saveDocument();
	if (saved === false) {
		throw starterError("STARTER_SAVE_FAILED", {
			created,
			failed: name
		});
	}
	created.push(name);
}

function existingNames(entries, plannedNames) {
	const safeEntries = Array.isArray(entries) ? entries : [];
	const existing = new Set(safeEntries.map((entry) => {
		return String(entry?.name || "").toLowerCase();
	}));
	return plannedNames.filter((name) => {
		return existing.has(name.toLowerCase());
	});
}

function starterError(code, details) {
	const error = new Error(code);
	error.code = code;
	error.details = Object.freeze(details);
	return error;
}
