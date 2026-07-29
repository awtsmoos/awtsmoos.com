//B"H
//Boruch Hashem
//Blessed is He

import { createShellActionRunner } from "./actionRunner.js";
import { pinnedApps } from "./appCatalog.js";
import { launchApp } from "./appLauncher.js";

/**
 * @file pinnedApps.js
 * @description
 * The Awtsmoos rests frequent program entrances beside living supervised tasks.
 * Awtsmoos.com guards each dock launch against duplicate touch and silent failure.
 */

export function renderPinnedApps(os) {
	const root = document.getElementById("shell-pinned-apps");
	if (!root) {
		return () => {};
	}
	const run = createShellActionRunner();
	root.replaceChildren();
	for (const app of pinnedApps()) {
		root.append(createPinnedButton(os, app, run));
	}
	return () => root.replaceChildren();
}

function createPinnedButton(os, app, run) {
	const button = document.createElement("button");
	button.type = "button";
	button.className = "shell-pinned-app";
	button.dataset.appId = app.id;
	button.dataset.actionId = `pinned-${app.id}`;
	button.title = `${app.title} — ${app.description}`;
	button.setAttribute("aria-label", `Open ${app.title}`);
	const icon = document.createElement("span");
	icon.className = "shell-pinned-icon";
	icon.setAttribute("aria-hidden", "true");
	icon.textContent = app.icon;
	const label = document.createElement("span");
	label.className = "shell-pinned-label";
	label.textContent = app.title;
	button.append(icon, label);
	button.addEventListener("click", () => run(button, {
		id: app.id,
		title: app.title,
		run: () => launchApp(os, app)
	}));
	return button;
}
