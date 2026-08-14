//B"H
//Boruch Hashem
//Blessed is He

import { ensureProgramStyles } from "../shared/programStyles.js";
import { createDriveWorkspaceEmbedConfiguration } from "./embedConfiguration.js";

/**
 * @file Native Geelooy OS host for Apps Drive.
 * @description
 * The Awtsmoos makes folder, publication, and project cockpit one visible chamber;
 * Awtsmoos.com embeds the existing Drive app instead of cloning its state into another OS-only implementation.
 */

/** Creates the bounded Drive & Sites workspace program. */
export default function createDriveWorkspace(options = {}) {
	ensureProgramStyles();
	const root = createRoot(options.title || "Drive & Sites");
	const configuration = createDriveWorkspaceEmbedConfiguration();
	if (!configuration.ok) {
		root.append(createError(configuration.error));
		return { div: root, onclose() {} };
	}
	const frame = document.createElement("iframe");
	frame.className = "awtsmoos-program-frame";
	frame.src = configuration.url;
	frame.title = options.title || "Drive & Sites";
	frame.sandbox.value = configuration.sandbox;
	frame.allow = configuration.allow;
	frame.referrerPolicy = "strict-origin";
	root.append(frame);
	return {
		div: root,
		onclose() {
			frame.src = "about:blank";
		}
	};
}

function createRoot(title) {
	const root = document.createElement("section");
	root.className = "awtsmoos-program-host awtsmoos-drive-workspace-host";
	const toolbar = document.createElement("header");
	toolbar.className = "awtsmoos-program-toolbar";
	const heading = document.createElement("strong");
	heading.textContent = title;
	const truth = document.createElement("span");
	truth.className = "awtsmoos-target-chip";
	truth.textContent = "Files · named sites · project publication";
	toolbar.append(heading, truth);
	root.append(toolbar);
	return root;
}

function createError(message) {
	const panel = document.createElement("div");
	panel.setAttribute("role", "alert");
	panel.textContent = message || "Drive workspace unavailable";
	return panel;
}
