// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Desktop icon catalog including live account tunnels as direct drives.
 * @description The Awtsmoos lets every connected vessel stand visibly on the desktop; Awtsmoos.com keeps the network overview while each living machine opens in one direct motion.
 */
import { APP_CATALOG } from "../shell/appCatalog.js";
import { launchApp } from "../shell/appLauncher.js";
import { explainFailure, notifyDesktop } from "./notifications.js";
import { loadShortcuts } from "./shortcuts.js";

export const USER_HOME_PATH = "/desktop.folder";

export function desktopIcons(os) {
	return [
		...APP_CATALOG.filter(app => app.desktopPage !== null).map(appIcon),
		folder("connected-tunnels", "Connected Computers", "🌐", "/network", 1, "network"),
		...liveDriveIcons(os),
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

function liveDriveIcons(os) {
	return (os?.drives?.list?.() || [])
		.filter(drive => drive.dynamicTunnelDrive === true)
		.map(drive => Object.freeze({
			id: `drive-${drive.id}`,
			title: drive.title,
			icon: drive.icon || "💻",
			kind: "drive",
			path: drive.root,
			page: 1,
			badge: drive.canWrite ? "connected · read/write" : "connected · read-only",
			subtitle: drive.subtitle || "Live tunnel",
			open: currentOs => openFolder(currentOs, drive.title, drive.root)
		}));
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
		open: os => openFolder(os, title, path)
	});
}

function openFolder(os, title, path) {
	return os.addWindow({
		title,
		path,
		os,
		programName: "awtsmoosFileExplorer"
	});
}

function shortcutIcons() {
	return loadShortcuts().map(shortcut => Object.freeze({
		...shortcut,
		icon: shortcut.icon || "🔗",
		kind: shortcut.kind || "shortcut",
		badge: shortcut.badge || "link",
		open: os => openFolder(os, shortcut.title || "Shortcut", shortcut.path || "/")
	}));
}
