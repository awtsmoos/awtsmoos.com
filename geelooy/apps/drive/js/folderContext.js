//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module FolderContext
 * @description
 * Builds the "take all your instructions from this folder" context capsule.
 *
 * buildFolderContext({ folderPath, listFn, readFn, instructionFileNames, maxDepth, maxFiles, historyFn })
 *   -> { ok, scope, instructions, tree, capsule }
 *
 *   scope        - normalized absolute folder path the agent is confined to.
 *   instructions - [{ file, content }] for every instruction file found
 *                  (defaults: FOLDER_INSTRUCTIONS.md, AGENTS.md).
 *   tree         - depth-limited directory listing of the folder.
 *   capsule      - compact object for the model: { objective, inventory,
 *                  instructionFiles, recentChanges, truncated }.
 *
 * listFn(path) -> [{ name, path, type: 'file'|'folder', mtime?, size? }]
 * readFn(path) -> string | { content }   (both shapes accepted)
 * historyFn(path) -> [{ at, kind, path }]  (optional; recent changes)
 *
 * Pure over injected functions; no imports of app state. Never throws on a
 * missing folder — returns { ok:false, error:'folder_context_not_found' }.
 */

export const DEFAULT_INSTRUCTION_FILES = Object.freeze(['FOLDER_INSTRUCTIONS.md', 'AGENTS.md']);
export const DEFAULT_MAX_DEPTH = 3;
export const DEFAULT_MAX_FILES = 400;

export function normalizeFolderPath(path) {
	const parts = String(path || '/').split('/').filter(Boolean);
	const out = [];
	for (const part of parts) {
		if (part === '.') continue;
		if (part === '..') { out.pop(); continue; }
		out.push(part);
	}
	return '/' + out.join('/');
}

function extOf(name) {
	const i = String(name).lastIndexOf('.');
	return i > 0 ? String(name).slice(i + 1).toLowerCase() : '(none)';
}

async function readText(readFn, path) {
	const out = await readFn(path);
	if (typeof out === 'string') return out;
	if (out && typeof out.content === 'string') return out.content;
	return '';
}

async function buildTree(listFn, root, maxDepth, maxFiles, budget) {
	const tree = [];
	// level 1 = the root's direct children; folders recurse while level < maxDepth.
	async function walk(dir, level) {
		if (level > maxDepth || budget.used >= maxFiles) return;
		let items = [];
		try {
			items = (await listFn(dir)) || [];
		} catch {
			return; // unreadable branch: skip honestly, keep walking siblings
		}
		for (const item of items) {
			if (budget.used >= maxFiles) break;
			budget.used += 1;
			const entry = {
				name: item.name,
				path: item.path || `${dir}/${item.name}`,
				type: item.type === 'folder' ? 'folder' : 'file',
				size: item.size || 0,
				mtime: item.mtime || null
			};
			tree.push(entry);
			if (entry.type === 'folder') await walk(entry.path, level + 1);
		}
	}
	await walk(root, 1);
	return tree;
}

function objectiveFrom(instructions) {
	for (const { content } of instructions) {
		const line = String(content || '')
			.split('\n')
			.map(s => s.trim())
			.find(s => s && !s.startsWith('#'));
		if (line) return line.slice(0, 280);
	}
	return null;
}

export async function buildFolderContext({
	folderPath,
	listFn,
	readFn,
	instructionFileNames = DEFAULT_INSTRUCTION_FILES,
	maxDepth = DEFAULT_MAX_DEPTH,
	maxFiles = DEFAULT_MAX_FILES,
	historyFn = null
} = {}) {
	const scope = normalizeFolderPath(folderPath);
	if (typeof listFn !== 'function') {
		return { ok: false, error: 'folder_context_missing_list', scope };
	}

	let rootItems;
	try {
		rootItems = await listFn(scope);
	} catch (err) {
		return { ok: false, error: 'folder_context_not_found', scope, detail: String(err && err.message || err) };
	}
	if (!Array.isArray(rootItems)) {
		return { ok: false, error: 'folder_context_not_found', scope };
	}

	const budget = { used: 0 };
	const tree = await buildTree(listFn, scope, maxDepth, maxFiles, budget);
	const truncated = budget.used >= maxFiles;

	const instructions = [];
	if (typeof readFn === 'function') {
		const rootNames = new Set(rootItems.map(i => i.name));
		for (const fileName of instructionFileNames) {
			if (!rootNames.has(fileName)) continue;
			try {
				const content = await readText(readFn, `${scope}/${fileName}`);
				instructions.push({ file: fileName, content });
			} catch {
				// an unreadable instruction file is noted, never fatal
				instructions.push({ file: fileName, content: '', unreadable: true });
			}
		}
	}

	let recentChanges = [];
	if (typeof historyFn === 'function') {
		try {
			recentChanges = (await historyFn(scope)) || [];
		} catch { recentChanges = []; }
	}

	const inventory = {};
	for (const entry of tree) {
		if (entry.type !== 'file') continue;
		const ext = extOf(entry.name);
		inventory[ext] = (inventory[ext] || 0) + 1;
	}

	const capsule = {
		scope,
		objective: objectiveFrom(instructions),
		fileCount: tree.filter(e => e.type === 'file').length,
		folderCount: tree.filter(e => e.type === 'folder').length,
		inventory,
		instructionFiles: instructions.map(i => i.file),
		recentChanges: recentChanges.slice(0, 20),
		truncated
	};

	return { ok: true, scope, instructions, tree, capsule };
}
