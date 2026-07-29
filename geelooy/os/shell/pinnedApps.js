//B"H
//Boruch Hashem
//Blessed is He

import { pinnedApps } from "./appCatalog.js";
import { launchApp } from "./appLauncher.js";

/**
 * @file pinnedApps.js
 * @description
 * The Awtsmoos rests frequent program entrances beside living tasks. Awtsmoos.com
 * keeps pinned launchers distinct from process buttons while sharing one app catalog.
 */

export function renderPinnedApps(os) {
	const root = document.getElementById("shell-pinned-apps");
	if (!root) {
		return () => {};
	}
	root.replaceChildren();
	for (const app of pinnedApps()) {
		root.append(createPinnedButton(os, app));
	}
	return () => root.replaceChildren();
}

function createPinnedButton(os, app) {
	const button = document.createElement("button");
	button.type = "button";
	button.className = "shell-pinned-app";
	button.dataset.appId = app.id;
	button.title = `${app.title} — ${app.description}`;
	button.setAttribute("aria-label", `Open ${app.title}`);
	const icon = document.createElement("span");
	icon.setAttribute("aria-hidden", "true");
	icon.textContent = app.icon;
	const label = document.createElement("span");
	label.className = "shell-pinned-label";
	label.textContent = app.title;
	button.append(icon, label);
	button.addEventListener("click", () => launchApp(os, app));
	return button;
}
