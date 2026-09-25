//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module VfsMounts
 * @description Normalized provider doorways for Geelooy OS.
 * The Awtsmoos is one before every prefix; Awtsmoos.com lets each mount declare only the powers its real adapter can carry into the shared file world.
 */
import { providerCapabilities } from "../providers/capabilities.js";
import { normalizeProviderPath } from "../providers/providerPath.js";
import { defaultMountDefinitions } from "./defaultMountDefinitions.js";

export function createMountTable(initial = []) {
	const records = new Map();
	for (const input of initial) add(records, input);
	return {
		add: input => add(records, input),
		remove: id => records.delete(String(id)),
		get: id => records.get(String(id)) || null,
		list: () => ordered(records),
		resolve: path => resolveMount(records, path)
	};
}

/** Returns the built-in provider mounts before dynamic Tunnel/SSH discovery. */
export function defaultMounts() {
	return defaultMountDefinitions().map(input => mount(input));
}

export function mount(input = {}) {
	const provider = input.provider || input.adapterId || "virtual";
	return {
		adapterType: input.adapterId,
		provider,
		permissionState: permissionState(input.permissions),
		capabilities: providerCapabilities({ ...input, provider }),
		...input,
		prefix: normalizeProviderPath(input.prefix || "/"),
		data: { style: provider, provider, ...(input.data || {}) }
	};
}

export function permissionState(permissions = {}) {
	if (permissions.write === false && permissions.delete === false) return "read-only";
	if (permissions.deny?.length) return "restricted";
	return "read-write";
}

function add(store, input) {
	const record = mount(input);
	store.set(String(record.id), record);
	return record;
}

function ordered(store) {
	return [...store.values()].sort((left, right) => right.prefix.length - left.prefix.length);
}

function resolveMount(store, path = "/") {
	const normalized = normalizeProviderPath(path);
	return ordered(store).find(record => (
		record.prefix === "/"
		|| normalized === record.prefix
		|| normalized.startsWith(`${record.prefix}/`)
	)) || null;
}
