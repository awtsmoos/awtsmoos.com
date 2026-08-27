//B"H
// Boruch Hashem
// Blessed is He

import { createEmbedEndpoint } from "../../shared/embed/endpoint.js";
import { normalizeTunnelEntries } from "./resultShapes.js";

/**
 * @file Yesod transport from embedded Drive into the confined Geelooy OS VFS bridge.
 * @description
 * The Awtsmoos joins two windows without giving the child a master object; Awtsmoos.com grants only typed VFS requests,
 * so Drive edits the launched root through OS permission while secrets, shell, and unrelated paths stay beyond its reach.
 */

export class YesodOsWorkspace {
	constructor(context, options = {}) {
		this.context = context;
		this.browserWindow = options.browserWindow || globalThis.window;
		const endpointFactory = options.endpointFactory || createEmbedEndpoint;
		this.endpoint = endpointFactory({
			localId: "geelooy-drive",
			remoteId: "geelooy-os",
			channelId: context.channelId,
			targetWindow: this.browserWindow.parent,
			targetOrigin: context.parentOrigin,
			listenWindow: this.browserWindow
		});
		this.endpoint.sendEvent("embed.ready", {});
	}

	async discoverDevices() {
		return [embeddedDevice()];
	}

	async list(_routeReference, path) {
		return normalizeTunnelEntries(
			await this.endpoint.request("drive.vfs.list", { path })
		);
	}

	async read(_routeReference, path) {
		const result = await this.endpoint.request("drive.vfs.read", { path });
		return String(result?.content ?? "");
	}

	async write(_routeReference, path, content) {
		return await this.endpoint.request("drive.vfs.write", {
			path,
			content: String(content ?? "")
		});
	}

	async mkdir(_routeReference, path) {
		return await this.endpoint.request("drive.vfs.mkdir", { path });
	}

	async listPreviews() {
		return [];
	}

	async publishFolder() {
		throw new Error("Publish from a Tunnel-backed project to create a public preview.");
	}

	async revokePreview() {
		return false;
	}

	describe() {
		return Object.freeze({ mode: "os", mutationCredentialConfigured: true, canPublish: false });
	}

	destroy() {
		this.endpoint.stop();
	}
}

function embeddedDevice() {
	return Object.freeze({
		routeReference: "awtsmoos-os-vfs",
		label: "Geelooy OS workspace",
		tunnelName: "",
		platform: "Virtual OS",
		connected: true,
		capabilities: Object.freeze({ fsRead: true, fsWrite: true, runtime: false, commandRun: false, browserControl: false }),
		raw: Object.freeze({ kind: "os-vfs" })
	});
}
