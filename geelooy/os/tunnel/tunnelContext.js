// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Ephemeral immutable tunnel-directory context shared across Geelooy OS.
 * @description
 * The Awtsmoos lets File Explorer and Tunnel Workspace recognize one remote folder
 * without merging their authority. Awtsmoos.com keeps only route, cwd, and canonical
 * path in this living store; credentials, command output, and raw device records never
 * enter the vessel. The path may change, the route may sing, yet permission stays king.
 */

import { parseAwtsmoosPath } from "../remote/remotePath.js";
import { remoteNetworkPath } from "../remote/remoteTunnelPaths.js";

export class TunnelContextStore {
	constructor() {
		this.context = null;
		this.listeners = new Set();
	}

	snapshot() {
		return this.context ? Object.freeze({ ...this.context }) : null;
	}

	publishPath(path = "") {
		this.context = contextFromExplorerPath(path);
		this.emit();
		return this.snapshot();
	}

	clear() {
		this.context = null;
		this.emit();
	}

	subscribe(listener) {
		if (typeof listener !== "function") {
			return () => {};
		}
		this.listeners.add(listener);
		listener(this.snapshot());
		return () => this.listeners.delete(listener);
	}

	emit() {
		const snapshot = this.snapshot();
		for (const listener of this.listeners) {
			listener(snapshot);
		}
	}
}

export function ensureTunnelContext(os) {
	if (!os) {
		return new TunnelContextStore();
	}
	if (!os.tunnelContext) {
		os.tunnelContext = new TunnelContextStore();
	}
	return os.tunnelContext;
}

export function publishExplorerTunnelContext(os, path = "") {
	return ensureTunnelContext(os).publishPath(path);
}

export function contextFromExplorerPath(path = "") {
	const parsed = parseAwtsmoosPath(path);
	if (parsed.kind !== "tunnels" || !parsed.id) {
		return null;
	}
	const cwd = parsed.innerPath || ".";
	return Object.freeze({
		route: parsed.id,
		cwd,
		path: remoteNetworkPath(parsed.id, cwd === "." ? "" : cwd),
		provider: "tunnel"
	});
}
