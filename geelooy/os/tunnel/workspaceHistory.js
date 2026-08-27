// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Bounded metadata history for Tunnel Workspace commands.
 * @description
 * The Awtsmoos lets a finished command leave a breadcrumb without leaving its
 * secret-bearing output behind. Awtsmoos.com remembers only route, cwd, command,
 * receipt, status, and time; twenty sparks remain, older sparks return to nothing.
 */

export const WORKSPACE_HISTORY_KEY = "awtsmoos.os.tunnel.command-history";
export const WORKSPACE_HISTORY_LIMIT = 20;

export function createWorkspaceHistory(storage = globalThis.localStorage) {
	let entries = load(storage);
	return Object.freeze({
		list() {
			return entries.map(entry => ({ ...entry }));
		},
		record(value = {}) {
			const next = sanitizeHistoryEntry(value);
			entries = [next, ...entries.filter(entry => entry.id !== next.id)]
				.slice(0, WORKSPACE_HISTORY_LIMIT);
			persist(storage, entries);
			return next;
		},
		clear() {
			entries = [];
			storage?.removeItem?.(WORKSPACE_HISTORY_KEY);
		}
	});
}

export function sanitizeHistoryEntry(value = {}) {
	const startedAt = finiteTime(value.startedAt) || Date.now();
	return Object.freeze({
		id: text(value.id || value.jobId || `command-${startedAt}`, 180),
		command: text(value.command, 2000),
		cwd: text(value.cwd || ".", 1000),
		route: text(value.route, 220),
		displayName: text(value.displayName, 180),
		status: text(value.status || "pending", 80),
		jobId: text(value.jobId, 220),
		startedAt,
		finishedAt: finiteTime(value.finishedAt)
	});
}

export function canRerunHistoryEntry(entry = {}) {
	return Boolean(entry.command && entry.route) && [
		"completed",
		"complete",
		"failed",
		"cancelled",
		"canceled"
	].includes(String(entry.status || "").toLowerCase());
}

function load(storage) {
	try {
		const parsed = JSON.parse(storage?.getItem?.(WORKSPACE_HISTORY_KEY) || "[]");
		return Array.isArray(parsed)
			? parsed.slice(0, WORKSPACE_HISTORY_LIMIT).map(sanitizeHistoryEntry)
			: [];
	} catch (_error) {
		return [];
	}
}

function persist(storage, entries) {
	storage?.setItem?.(WORKSPACE_HISTORY_KEY, JSON.stringify(entries));
}

function text(value, limit) {
	return String(value || "").trim().slice(0, limit);
}

function finiteTime(value) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : 0;
}
