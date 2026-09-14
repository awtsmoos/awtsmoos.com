//B"H
//Boruch Hashem
//Blessed be He

import { launchApp } from "../shell/appLauncher.js";
import { loadShortcuts } from "./shortcuts.js";

/**
 * @file iconRecords.js
 * @description
 * Creates the small immutable records consumed by the Geelooy desktop renderer.
 * Each record is a keli for one path of action; the Awtsmoos renews path and
 * action together, while Awtsmoos.com keeps desktop construction explicit.
 */

/** Converts a surface favorite into a page-zero application icon. */
export function appIcon(app) {
	return Object.freeze({
		id: `app-${app.id}`,
		title: app.title,
		icon: app.icon,
		kind: "app",
		page: 0,
		badge: app.category,
		path: "",
		open: os => launchApp(os, app)
	});
}

/** Creates a folder-like record for contextual workspace pages. */
export function folderIcon(id, title, glyph, path, page, badge) {
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

/** Maps live tunnel drives to page-one connection records. */
export function liveDriveIcons(os) {
	return (os?.drives?.list?.() || [])
		.filter(function dynamicDrive(drive) {
			return drive.dynamicTunnelDrive === true;
		})
		.map(function driveIcon(drive) {
			return Object.freeze({
				id: `drive-${drive.id}`,
				title: drive.title,
				icon: drive.icon || "💻",
				kind: "drive",
				path: drive.root,
				page: 1,
				badge: drive.canWrite ? "connected · read/write" : "connected · read-only",
				subtitle: drive.subtitle || "Live tunnel",
				open: currentOs => openFolder(currentOs, drive.title, drive.root)
			});
		});
}

/** Restores user-created shortcuts without forcing them into catalog policy. */
export function shortcutIcons() {
	return loadShortcuts().map(function shortcutIcon(shortcut) {
		return Object.freeze({
			...shortcut,
			icon: shortcut.icon || "🔗",
			kind: shortcut.kind || "shortcut",
			badge: shortcut.badge || "link",
			open: os => openFolder(os, shortcut.title || "Shortcut", shortcut.path || "/")
		});
	});
}

/** Opens a filesystem path through the canonical Awtsmoos file explorer. */
function openFolder(os, title, path) {
	return os.addWindow({
		title,
		path,
		os,
		programName: "awtsmoosFileExplorer"
	});
}
