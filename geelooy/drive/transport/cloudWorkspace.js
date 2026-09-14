//B"H
//Boruch Hashem
//Blessed be He

import { workspaceBasename } from "../core/path.js";
import { CloudWorkspaceClient } from "./cloudWorkspaceClient.js";

export const CLOUD_WORKSPACE_PREFIX = "cloud:";

/**
 * @file Browser-native authenticated Awtsmoos Cloud workspace transport.
 * @description The Awtsmoos makes each owned alias a writable private cloud vessel;
 * Awtsmoos.com keeps Tunnel optional while ordinary editing reuses owner-scoped Drive APIs.
 */
export class YesodCloudWorkspace {
	constructor(options = {}) {
		this.client = options.client || new CloudWorkspaceClient(options);
		this.runtime = null;
	}

	/** Discovers one Builder workspace per alias already owned by the current account. */
	async discoverDevices() {
		return (await this.client.aliases()).map(cloudDevice);
	}

	/** Lists one bounded cloud folder and adapts canonical Drive metadata for Builder. */
	async list(routeReference, path = ".") {
		const aliasId = aliasFromRoute(routeReference);
		return (await this.client.list(aliasId, path)).map(entry => Object.freeze({
			name: workspaceBasename(entry.path),
			path: entry.path,
			type: entry.type === "folder" ? "directory" : entry.type,
			size: Number(entry.size || 0),
			modifiedAt: entry.updatedAt || entry.modifiedAt || "",
			raw: Object.freeze({ cloud: true, visibility: entry.visibility || "private" })
		}));
	}

	/** Reads one private text file from the alias selected by route identity. */
	read(routeReference, path) {
		return this.client.read(aliasFromRoute(routeReference), path);
	}

	/** Writes one private text file without promoting it to a public Site. */
	write(routeReference, path, content) {
		return this.client.write(aliasFromRoute(routeReference), path, content);
	}

	/** Creates one private cloud folder beneath the selected alias. */
	mkdir(routeReference, path) {
		return this.client.mkdir(aliasFromRoute(routeReference), path);
	}

	async listPreviews() {
		return [];
	}

	async publishFolder() {
		throw cloudError("CLOUD_WORKSPACE_USE_IMMUTABLE_PUBLISH");
	}

	async revokePreview() {
		return false;
	}

	describe() {
		return Object.freeze({
			mode: "cloud",
			mutationCredentialConfigured: true,
			canPublish: false
		});
	}

	destroy() {}
}

/** Returns whether a navigation route addresses an Awtsmoos Cloud alias. */
export function isCloudWorkspaceRoute(routeReference) {
	return String(routeReference || "").startsWith(CLOUD_WORKSPACE_PREFIX);
}

function cloudDevice(aliasId) {
	return Object.freeze({
		routeReference: `${CLOUD_WORKSPACE_PREFIX}${aliasId}`,
		label: aliasId,
		platform: "Awtsmoos Cloud",
		connected: true,
		capabilities: Object.freeze({ fsRead: true, fsWrite: true, runtime: false, commandRun: false }),
		raw: Object.freeze({ kind: "awtsmoos-cloud", aliasId })
	});
}

function aliasFromRoute(routeReference) {
	const route = String(routeReference || "");
	if (!isCloudWorkspaceRoute(route)) throw cloudError("CLOUD_WORKSPACE_ROUTE_INVALID");
	const aliasId = route.slice(CLOUD_WORKSPACE_PREFIX.length).trim();
	if (!aliasId) throw cloudError("CLOUD_WORKSPACE_ALIAS_REQUIRED");
	return aliasId;
}

function cloudError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}
