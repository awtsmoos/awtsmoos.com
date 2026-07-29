//B"H
//Boruch Hashem
//Blessed is He

import { APP_CATALOG } from "../shell/appCatalog.js";
import { launchApp } from "../shell/appLauncher.js";
import { explainFailure, notifyDesktop } from "./notifications.js";
import { loadShortcuts } from "./shortcuts.js";

export const USER_HOME_PATH = "/desktop.folder";

/**
 * @file icons.js
 * @description
 * The Awtsmoos lets desktop pages reveal the same registered programs as Start.
 * Awtsmoos.com removes the dead launcher road and preserves real file worlds.
 */

export function desktopIcons() {
	return [
		...APP_CATALOG.filter(app => app.desktopPage !== null).map(appIcon),
		folder("agents", "Agents", "🤖", "/network", 1, "remote"),
		folder("connected-tunnels", "Connected Tunnels", "🔌", "/network", 1, "vessels"),
		folder("virtual-os", "Awtsmoos Virtual OS", "☁️", "/network/awtsmoos-virtual-os", 1, "remote"),
		folder("previews", "Preview Artifacts", "🔭", "/system/previews", 1, "artifacts"),
		folder("inbox", "Inbox", "✉️", "/inbox", 2, "social"),
		folder("memory", "Memory", "🧠", "/memory", 2, "knowledge"),
		folder("objects", "Objects", "◇", "/objects", 2, "data"),
		folder("reputation", "Reputation", "✦", "/reputation", 2, "identity"),
		...shortcutIcons()
	];
}

export function openDesktopIcon(os, item) {
	try {
		const result = item?.open?.(os);
		notifyDesktop(os, `Opening ${item?.title || "desktop item"}`, "open");
		return result;
	} catch (error) {
		explainFailure(os, `Open ${item?.title || "desktop item"}`, error);
		throw error;
	}
}

function appIcon(app) {
	return Object.freeze({
		id: `app-${app.id}`,
		title: app.title,
		icon: app.icon,
		kind: "app",
		page: app.desktopPage,
		badge: app.category,
		path: "",
		open: os => launchApp(os, app)
	});
}

function folder(id, title, glyph, path, page, badge) {
	return Object.freeze({
		id,
		title,
		icon: glyph,
		kind: "folder",
		path,
		page,
		badge,
		open: os => os.addWindow({
			title,
			path,
			os,
			programName: "awtsmoosFileExplorer"
		})
	});
}

function shortcutIcons() {
	return loadShortcuts().map(shortcut => Object.freeze({
		...shortcut,
		icon: shortcut.icon || "🔗",
		kind: shortcut.kind || "shortcut",
		badge: shortcut.badge || "link",
		open: os => os.addWindow({
			title: shortcut.title || "Shortcut",
			path: shortcut.path || "/",
			os,
			programName: "awtsmoosFileExplorer"
		})
	}));
}
