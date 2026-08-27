//B"H
//Boruch Hashem
//Blessed is He

import { ensureProgramStyles } from "../shared/programStyles.js";
import { createDriveEmbedConfiguration } from "./embedConfiguration.js";
import { createDriveVfsBridge } from "./vfsBridge.js";

/**
 * @file Native Geelooy OS launcher for Geelooy Drive.
 * @description
 * The Awtsmoos joins cloud workspace and desktop without handing the iframe a master key;
 * Awtsmoos.com gives Drive a guarded VFS artery, making the same source writable while OS permission remains the sea.
 */

export default function createGeelooyDrive(options = {}) {
	ensureProgramStyles();
	const root = createRoot();
	const basePath = normalizeBasePath(options.path || "/");
	const configuration = createDriveEmbedConfiguration({
		basePath,
		initialPath: basePath
	});
	if (!configuration.ok) {
		root.append(createError(configuration.error));
		return { div: root, onclose() {} };
	}
	const iframe = createIframe(configuration);
	root.append(iframe);
	const detachBridge = createDriveVfsBridge({
		os: options.os,
		iframe,
		basePath,
		channelId: configuration.channelId,
		targetOrigin: configuration.targetOrigin
	});
	return {
		div: root,
		onclose() {
			detachBridge();
			iframe.src = "about:blank";
		}
	};
}

function createRoot() {
	const root = document.createElement("section");
	root.className = "awtsmoos-program-host geelooy-drive-shell";
	return root;
}

function createIframe(configuration) {
	const iframe = document.createElement("iframe");
	iframe.className = "awtsmoos-program-frame";
	iframe.src = configuration.url;
	iframe.title = "Geelooy Drive";
	iframe.sandbox.value = configuration.sandbox;
	iframe.referrerPolicy = "strict-origin";
	return iframe;
}

function createError(message) {
	const panel = document.createElement("div");
	panel.setAttribute("role", "alert");
	panel.textContent = message || "Geelooy Drive embed unavailable";
	return panel;
}

function normalizeBasePath(path = "/") {
	if (String(path).startsWith("awtsmoos://")) return String(path);
	return `/${String(path || "/").replace(/^\/+/, "")}`;
}
