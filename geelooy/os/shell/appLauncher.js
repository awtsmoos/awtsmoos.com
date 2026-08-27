//B"H
//Boruch Hashem
//Blessed is He

import { programs } from "../basicPrograms.js";
import { appById } from "./appCatalog.js";

/**
 * @file Geelooy OS catalog launcher.
 * @description
 * The Awtsmoos joins project intent to the registered program that can reveal it;
 * Awtsmoos.com lets Sites open the guarded Drive builder on the same VFS instead of disconnected tools.
 */

export function launchApp(os, appOrId, overrides = {}) {
	const app = typeof appOrId === "string" ? appById(appOrId) : appOrId;
	assertLaunchable(os, app);
	const defaults = starterPayload(app.id);
	return os.addWindow({
		...defaults,
		...overrides,
		os,
		programName: app.programName,
		title: overrides.title || defaults.title || app.title
	});
}

export function isRegisteredApp(app) {
	return Boolean(app?.programName && programs[app.programName]);
}

export function assertCatalogPrograms(apps) {
	for (const app of apps || []) {
		if (!isRegisteredApp(app)) {
			throw new Error(`Unregistered Geelooy app: ${app?.id || "unknown"}`);
		}
	}
	return true;
}

function assertLaunchable(os, app) {
	if (!os?.addWindow) {
		throw new Error("Geelooy OS window service is unavailable.");
	}
	if (!app) {
		throw new Error("Unknown Geelooy app.");
	}
	assertCatalogPrograms([app]);
}

function starterPayload(id) {
	const starters = {
		sites: {
			path: "/desktop.folder",
			title: "Sites"
		},
		files: {
			path: "/desktop.folder",
			title: "Files"
		},
		code: {
			content: "# B\"H\n\nWelcome to Apps Code inside Geelooy OS.\n",
			path: "/desktop.folder",
			title: "Welcome.md"
		},
		text: {
			content: "B\"H\n\nA new note in Geelooy OS.\n",
			path: "/desktop.folder",
			title: "New Note.txt"
		},
		preview: {
			content: "<!doctype html><main><h1>B\"H</h1><p>Geelooy workspace preview is ready.</p></main>",
			path: "/desktop.folder",
			title: "Welcome.html"
		},
		browser: {
			title: "Merkava Browser"
		},
		compiler: {
			content: "#include <stdio.h>\nint main(void) { puts(\"B\\\"H\"); return 0; }\n",
			path: "/desktop.folder",
			title: "hello.c"
		},
		binary: {
			content: "B\"H\nOpen a file from Files to inspect its exact content.",
			path: "/desktop.folder",
			title: "Binary Viewer.txt"
		},
		executable: {
			content: new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0]),
			detectedFormat: "wasm",
			extension: ".wasm",
			path: "/desktop.folder",
			title: "empty.wasm"
		},
		command: {
			path: "/desktop.folder",
			title: "Command"
		},
		tasks: {
			title: "Task Manager"
		},
		diagnostics: {
			title: "Diagnostics"
		}
	};
	return starters[id] || {};
}
