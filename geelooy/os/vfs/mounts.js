// B"H

import { providerCapabilities } from "../providers/capabilities.js";
import { normalizeProviderPath } from "../providers/providerPath.js";

/**
 * B"H — Mounts are normalized declarations of provider, capability, and place.
 * The table resolves the most specific doorway first, while the exported mount
 * shaper preserves the contract used by the VFS registry and graph synchronizer.
 */
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

export function defaultMounts() {
	return [
		mount({
			id: "mount:virtual",
			prefix: "/",
			adapterId: "virtual",
			provider: "virtual",
			title: "Awtsmoos Root",
			icon: "א",
			permissions: { read: true, write: true, delete: true, list: true }
		}),
		mount({
			id: "mount:tunnels",
			prefix: "/network/tunnels",
			adapterId: "tunnel",
			provider: "tunnel",
			title: "Connected Tunnels",
			icon: "💻",
			permissions: { read: true, list: true, write: false, delete: false }
		}),
		mount({
			id: "mount:network",
			prefix: "/network",
			adapterId: "tunnel",
			provider: "tunnel",
			title: "Network",
			icon: "🌐",
			permissions: { read: true, list: true, write: false, delete: false }
		}),
		mount({
			id: "mount:tunnels:legacy",
			prefix: "awtsmoos://tunnels",
			adapterId: "tunnel",
			provider: "tunnel",
			title: "Connected Tunnels",
			icon: "💻",
			permissions: { read: true, list: true, write: false, delete: false }
		}),
		previewMount("mount:previews", "/system/previews"),
		previewMount("mount:previews:legacy", "awtsmoos://previews"),
		receiptMount("mount:receipts", "/system/receipts"),
		receiptMount("mount:receipts:legacy", "awtsmoos://receipts")
	];
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

function previewMount(id, prefix) {
	return mount({
		id,
		prefix,
		adapterId: "preview",
		provider: "preview",
		title: "Preview Artifacts",
		icon: "🔭",
		permissions: { read: true, list: true, write: false, delete: false }
	});
}

function receiptMount(id, prefix) {
	return mount({
		id,
		prefix,
		adapterId: "preview",
		provider: "receipt",
		title: "Mission Receipts",
		icon: "🧾",
		permissions: { read: true, list: true, write: false, delete: false }
	});
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
	return ordered(store).find(record => record.prefix === "/" || normalized === record.prefix || normalized.startsWith(`${record.prefix}/`)) || null;
}
