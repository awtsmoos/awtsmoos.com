//B"H
//Boruch Hashem
//Blessed be He

import { BrowserWorkspaceDb } from "./browserWorkspaceDb.js";

export const BROWSER_WORKSPACE_ROUTE = "browser-local";

/**
 * Zero-install Builder transport backed by IndexedDB.
 * It gives remix visitors immediate private creation without pretending local browser data is cloud-hosted.
 */
export class YesodBrowserWorkspace {
	constructor(options = {}) {
		this.repository = options.repository || new BrowserWorkspaceDb(options.indexedDb);
		this.runtime = null;
	}

	async discoverDevices() {
		return [browserDevice()];
	}

	async list(routeReference, path = ".") {
		assertRoute(routeReference);
		return (await this.repository.list(path)).map(row => Object.freeze({
			name: row.name,
			type: row.type,
			size: Number(row.size || 0),
			modifiedAt: row.modifiedAt || "",
			raw: Object.freeze({ browserLocal: true })
		}));
	}

	async read(routeReference, path) {
		assertRoute(routeReference);
		return await this.repository.read(path);
	}

	async write(routeReference, path, content) {
		assertRoute(routeReference);
		return await this.repository.write(path, content);
	}

	async mkdir(routeReference, path) {
		assertRoute(routeReference);
		return await this.repository.mkdir(path);
	}

	async listPreviews() {
		return [];
	}

	async publishFolder() {
		throw browserError("BROWSER_WORKSPACE_PUBLISH_REQUIRES_CLOUD");
	}

	async revokePreview() {
		return false;
	}

	describe() {
		return Object.freeze({
			mode: "browser",
			mutationCredentialConfigured: true,
			canPublish: false
		});
	}

	destroy() {}
}

function browserDevice() {
	return Object.freeze({
		routeReference: BROWSER_WORKSPACE_ROUTE,
		label: "Browser Workspace",
		tunnelName: "",
		platform: "IndexedDB",
		connected: true,
		capabilities: Object.freeze({
			fsRead: true,
			fsWrite: true,
			runtime: false,
			commandRun: false,
			browserControl: false
		}),
		raw: Object.freeze({ kind: "browser-local" })
	});
}

function assertRoute(routeReference) {
	if (routeReference !== BROWSER_WORKSPACE_ROUTE) throw browserError("BROWSER_WORKSPACE_ROUTE_INVALID");
}

function browserError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}
