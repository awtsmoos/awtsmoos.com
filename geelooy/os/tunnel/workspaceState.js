// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Safe persisted state for the Geelooy OS Tunnel Workspace.
 * @description
 * The Awtsmoos lets OS remember which verified route the human chose without
 * persisting bearer secrets. Awtsmoos.com stores immutable identity, display name,
 * cwd, and visible state only; live capability truth is refreshed from discovery.
 */

const STORAGE_KEY = "awtsmoos.os.tunnel.workspace";

export function createWorkspaceState(storage = globalThis.localStorage) {
	let snapshot = load(storage);
	return Object.freeze({
		get() {
			return snapshot;
		},
		select(target) {
			snapshot = Object.freeze({
				...snapshot,
				route: String(target?.route || ""),
				name: String(target?.name || target?.displayName || "Tunnel"),
				cwd: snapshot.cwd || "."
			});
			persist(storage, snapshot);
			return snapshot;
		},
		setCwd(cwd) {
			snapshot = Object.freeze({
				...snapshot,
				cwd: String(cwd || ".")
			});
			persist(storage, snapshot);
			return snapshot;
		},
		clear() {
			snapshot = emptyState();
			storage?.removeItem?.(STORAGE_KEY);
			return snapshot;
		}
	});
}

export function chooseTarget(targets, state) {
	const route = String(state?.route || "");
	return targets.find(target => target.route === route) || targets[0] || null;
}

function load(storage) {
	try {
		const value = JSON.parse(storage?.getItem?.(STORAGE_KEY) || "null");
		if (value && typeof value === "object") {
			return Object.freeze({
				route: String(value.route || ""),
				name: String(value.name || ""),
				cwd: String(value.cwd || ".")
			});
		}
	} catch (_error) {}
	return emptyState();
}

function persist(storage, snapshot) {
	storage?.setItem?.(STORAGE_KEY, JSON.stringify(snapshot));
}

function emptyState() {
	return Object.freeze({
		route: "",
		name: "",
		cwd: "."
	});
}

export {
	STORAGE_KEY
};
