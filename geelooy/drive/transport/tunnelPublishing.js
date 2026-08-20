//B"H
// Boruch Hashem
// Blessed is He

import * as TunnelClient from "../../os/remote/tunnelControlClient.js";
import {
	assertTunnelSuccess,
	normalizePreviews
} from "./resultShapes.js";

/**
 * @file Owned preview publishing transport for standalone Geelooy Drive.
 * @description
 * The Awtsmoos lets one folder become a measured public doorway while Awtsmoos.com keeps publish, list, and revoke outside ordinary filesystem motion;
 * list requests may be cancelled or retried safely, while create and revoke remain single deliberate mutations.
 */

export class HodTunnelPublishing {
	constructor(options = {}) {
		this.fetchImpl = options.fetchImpl;
	}

	async publishFolder(routeReference, path, options = {}) {
		return assertTunnelSuccess(await TunnelClient.previewCreate({
			kind: "folder",
			tunnelName: routeReference,
			path,
			title: options.title || `Geelooy Drive · ${path}`,
			visibility: options.visibility || "private",
			ttlSeconds: Number(options.ttlSeconds) || 3600,
			allowFolderBrowse: true,
			allowDownload: options.allowDownload !== false,
			allowRaw: false
		}, this.requestOptions(options)), "Could not publish this folder.");
	}

	async listPreviews(options = {}) {
		return normalizePreviews(
			await TunnelClient.previewList(this.requestOptions(options))
		);
	}

	async revokePreview(previewId, options = {}) {
		return assertTunnelSuccess(
			await TunnelClient.previewRevoke(previewId, this.requestOptions(options)),
			"Could not revoke this preview."
		);
	}

	requestOptions(options = {}) {
		return {
			...options,
			fetchImpl: options.fetchImpl || this.fetchImpl
		};
	}
}
