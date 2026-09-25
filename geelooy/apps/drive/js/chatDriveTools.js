//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ChatDriveTools
 * @description
 * The drive tool surface for folder-scoped chat agents, modeled on the
 * Website Maker's agentActionCatalog pattern (js/builder/agentActionCatalog.js):
 * pure, JSON-able action definitions compiled into an immutable catalog, plus
 * pure tool functions over injectable drive-API functions.
 *
 * Every tool is scoped to one folder path. Scope is enforced inside every
 * implementation: any source, destination, or target path that does not live
 * under the scope root returns { ok:false, error:'chat_drive_scope_escape' }
 * without touching the drive. This is what lets a user say "take all your
 * instructions from this folder" and know the agent cannot wander.
 *
 * Injectable drive API (all optional; missing ones yield { ok:false, error:'chat_drive_capability_missing' }):
 *   listFn(path)                       -> [{ name, path, type, ... }]
 *   createFolderFn(parentPath, name)    -> { path, ... }
 *   moveFn(fromPath, toPath)           -> { path, ... }
 *   renameFn(path, newName)            -> { path, ... }
 *   labelFn(path, label)               -> { path, ... }
 *   searchFn(folderPath, query)        -> [{ name, path, type, ... }]
 *   setSemanticNameFn(path, name)      -> { path, ... }
 *
 * Paths are VFS-style absolute drive paths (e.g. "/drive/Projects/site").
 */

export const CHAT_DRIVE_GROUP = 'chat.drive';

function define(name, title, mutates, capability, description) {
	return Object.freeze({ name, group: CHAT_DRIVE_GROUP, title, mutates, capability, description });
}

export const CHAT_DRIVE_TOOL_DEFINITIONS = Object.freeze([
	define('chat.drive.list', 'List scoped folder', false, 'drive.read',
		'List files and folders directly under the scoped folder path.'),
	define('chat.drive.createFolder', 'Create folder in scope', true, 'drive.write',
		'Create one folder under the scoped folder path.'),
	define('chat.drive.move', 'Move within scope', true, 'drive.write',
		'Move a file or folder from one scoped path to another scoped path.'),
	define('chat.drive.rename', 'Rename within scope', true, 'drive.write',
		'Rename a file or folder that lives under the scoped folder path.'),
	define('chat.drive.label', 'Label within scope', true, 'drive.write',
		'Attach a label to a file or folder under the scoped folder path.'),
	define('chat.drive.search', 'Search within scope', false, 'drive.read',
		'Search for files and folders under the scoped folder path.'),
	define('chat.drive.setSemanticName', 'Set semantic name in scope', true, 'drive.write',
		'Set the semantic (human) name of a file or folder under the scoped folder path.')
]);

/** Compiled immutable catalog, mirroring the builder's AGENT_ACTIONS shape. */
export const CHAT_DRIVE_ACTIONS = Object.freeze(
	CHAT_DRIVE_TOOL_DEFINITIONS.map(def => Object.freeze({
		...def,
		available: true,
		evidenceScope: 'chat-folder-scope',
		replay: def.mutates ? 'reconcile-before-replay' : 'safe-read',
		idempotency: def.mutates ? 'not-provided' : 'not-applicable',
		externalVerification: 'not-implied'
	}))
);

/** Returns one compiled action contract by exact machine name. */
export function chatDriveActionMetadata(name) {
	return CHAT_DRIVE_ACTIONS.find(item => item.name === name) || null;
}

/**
 * Append the chat-drive tool definitions to a host catalog (without mutating
 * the host's existing entries), and return the new catalog array.
 * Mirrors how agentActionCatalog.js compiles definitions into AGENT_ACTIONS.
 */
export function registerChatDriveTools(catalog = []) {
	const known = new Set(catalog.map(entry => entry && entry.name));
	const additions = CHAT_DRIVE_ACTIONS.filter(action => !known.has(action.name));
	return [...catalog, ...additions];
}

/* ------------------------------------------------------------------ */
/* Scoping                                                             */
/* ------------------------------------------------------------------ */

export function normalizeDrivePath(path) {
	const parts = String(path || '/').split('/').filter(Boolean);
	const out = [];
	for (const part of parts) {
		if (part === '.') continue;
		if (part === '..') { out.pop(); continue; }
		out.push(part);
	}
	return '/' + out.join('/');
}

export function isInScope(scopeRoot, path) {
	const scope = normalizeDrivePath(scopeRoot);
	const target = normalizeDrivePath(path);
	return target === scope || target.startsWith(scope === '/' ? '/' : scope + '/');
}

function scopeEscape(path) {
	return { ok: false, error: 'chat_drive_scope_escape', path: normalizeDrivePath(path) };
}

function capabilityMissing(name) {
	return { ok: false, error: 'chat_drive_capability_missing', tool: name };
}

/**
 * Build the folder-scoped tool implementations.
 * @param {string} scopeRoot - absolute drive folder the agent is confined to.
 * @param {object} api - injectable drive-API functions (see module header).
 * @returns {object} frozen map of tool name -> async function returning JSON-able results.
 */
export function createChatDriveTools(scopeRoot, api = {}) {
	const scope = normalizeDrivePath(scopeRoot);
	if (scope === '/') {
		throw new Error('createChatDriveTools: refusing unscoped root "/" — pick a real folder.');
	}

	function guard(path) {
		return isInScope(scope, path) ? null : scopeEscape(path);
	}

	const tools = {
		'chat.drive.list': async ({ folderPath } = {}) => {
			const at = normalizeDrivePath(folderPath || scope);
			const blocked = guard(at);
			if (blocked) return blocked;
			if (typeof api.listFn !== 'function') return capabilityMissing('chat.drive.list');
			const items = await api.listFn(at);
			return { ok: true, scope, path: at, items: (items || []).filter(i => isInScope(scope, i.path || '')) };
		},

		'chat.drive.createFolder': async ({ name, folderPath } = {}) => {
			const clean = String(name || '').trim().replace(/[\\/]/g, '');
			if (!clean) return { ok: false, error: 'chat_drive_invalid_name', name };
			const parent = normalizeDrivePath(folderPath || scope);
			const blocked = guard(parent);
			if (blocked) return blocked;
			if (typeof api.createFolderFn !== 'function') return capabilityMissing('chat.drive.createFolder');
			const created = await api.createFolderFn(parent, clean);
			return { ok: true, scope, ...(created || {}), path: normalizeDrivePath(`${parent}/${clean}`) };
		},

		'chat.drive.move': async ({ from, to } = {}) => {
			const src = normalizeDrivePath(from);
			const dst = normalizeDrivePath(to);
			const blocked = guard(src) || guard(dst);
			if (blocked) return blocked;
			if (src === dst) return { ok: false, error: 'chat_drive_noop_move', from: src, to: dst };
			if (typeof api.moveFn !== 'function') return capabilityMissing('chat.drive.move');
			const moved = await api.moveFn(src, dst);
			return { ok: true, scope, ...(moved || {}), from: src, to: dst };
		},

		'chat.drive.rename': async ({ path, newName } = {}) => {
			const at = normalizeDrivePath(path);
			const blocked = guard(at);
			if (blocked) return blocked;
			const clean = String(newName || '').trim().replace(/[\\/]/g, '');
			if (!clean) return { ok: false, error: 'chat_drive_invalid_name', newName };
			if (typeof api.renameFn !== 'function') return capabilityMissing('chat.drive.rename');
			const renamed = await api.renameFn(at, clean);
			return { ok: true, scope, ...(renamed || {}), path: at, newName: clean };
		},

		'chat.drive.label': async ({ path, label } = {}) => {
			const at = normalizeDrivePath(path);
			const blocked = guard(at);
			if (blocked) return blocked;
			const clean = String(label || '').trim();
			if (!clean) return { ok: false, error: 'chat_drive_invalid_label', label };
			if (typeof api.labelFn !== 'function') return capabilityMissing('chat.drive.label');
			const labeled = await api.labelFn(at, clean);
			return { ok: true, scope, ...(labeled || {}), path: at, label: clean };
		},

		'chat.drive.search': async ({ query, folderPath } = {}) => {
			const q = String(query || '').trim();
			if (!q) return { ok: true, scope, query: q, items: [] };
			const at = normalizeDrivePath(folderPath || scope);
			const blocked = guard(at);
			if (blocked) return blocked;
			if (typeof api.searchFn !== 'function') return capabilityMissing('chat.drive.search');
			const items = await api.searchFn(at, q);
			return { ok: true, scope, query: q, path: at, items: (items || []).filter(i => isInScope(scope, i.path || '')) };
		},

		'chat.drive.setSemanticName': async ({ path, semanticName } = {}) => {
			const at = normalizeDrivePath(path);
			const blocked = guard(at);
			if (blocked) return blocked;
			const clean = String(semanticName || '').trim();
			if (!clean) return { ok: false, error: 'chat_drive_invalid_semantic_name', semanticName };
			if (typeof api.setSemanticNameFn !== 'function') return capabilityMissing('chat.drive.setSemanticName');
			const updated = await api.setSemanticNameFn(at, clean);
			return { ok: true, scope, ...(updated || {}), path: at, semanticName: clean };
		}
	};

	return Object.freeze(tools);
}
