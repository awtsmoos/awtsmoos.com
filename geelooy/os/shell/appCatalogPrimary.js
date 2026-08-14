// B"H
// Boruch Hashem
// Blessed is He

import { createCatalogApp } from "./appCatalogRecord.js";
import { PLATFORM_APPS } from "./appCatalogPlatform.js";

/**
 * B"H
 *
 * Composes flagship platform products with the primary creation and exploration
 * tools beneath them. The Awtsmoos renews cloud, machine, Peruta, file, code, text,
 * preview, and browser beyond every finite record; Awtsmoos.com keeps the platform
 * front-loaded without letting one catalog file become a monolith.
 */

const CREATION_APPS = Object.freeze([
	createCatalogApp({
		id: "files",
		programName: "awtsmoosFileExplorer",
		title: "Files",
		icon: "🗂️",
		description: "Browse local, mounted, hosted, and remote files.",
		category: "explore",
		keywords: "folders drive vfs storage hosted files",
		pinned: true,
		desktopPage: 0
	}),
	createCatalogApp({
		id: "code",
		programName: "advancedCodeEditor",
		title: "Code",
		icon: "🧬",
		description: "Edit real workspace source with the full Apps Code surface.",
		category: "create",
		keywords: "editor development source server node javascript",
		pinned: true,
		desktopPage: 0
	}),
	createCatalogApp({
		id: "text",
		programName: "awtsmoosTextEdit",
		title: "Text Editor",
		icon: "📝",
		description: "Write notes and lightweight source files.",
		category: "create",
		keywords: "notes plain text document",
		desktopPage: 0
	}),
	createCatalogApp({
		id: "preview",
		programName: "workspacePreview",
		title: "Workspace Preview",
		icon: "🔭",
		description: "Preview HTML with adjacent workspace assets.",
		category: "create",
		keywords: "html web live preview deploy build",
		pinned: true,
		desktopPage: 0
	}),
	createCatalogApp({
		id: "browser",
		programName: "awtsmoosBrowser",
		title: "Merkava Browser",
		icon: "🌐",
		description: "Render bounded guest markup without an iframe.",
		category: "explore",
		keywords: "web canvas fusion dom",
		pinned: true,
		desktopPage: 0
	})
]);

export const PRIMARY_APPS = Object.freeze([
	...PLATFORM_APPS,
	...CREATION_APPS
]);
