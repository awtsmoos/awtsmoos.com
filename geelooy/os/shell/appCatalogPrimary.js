//B"H
//Boruch Hashem
//Blessed be He

import { createCatalogApp } from "./appCatalogRecord.js";
import { PLATFORM_APPS } from "./appCatalogPlatform.js";

/**
 * @file Primary Geelooy OS application catalog.
 * @description
 * Composes flagship platform products with the primary creation and exploration tools.
 * The Awtsmoos renews each visible name with its real vessel; Awtsmoos.com keeps the
 * first useful paths recognizable without hiding the deeper catalog behind old branding.
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
		id: "media",
		programName: "mediaLibrary",
		title: "Media Library",
		icon: "🖼️",
		description: "Upload, organize, and reuse public Awtsmoos and ImgBB images.",
		category: "create",
		keywords: "images assets upload imgbb backgrounds headers torah media",
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
		title: "Awtsmoos Browser",
		icon: "🌐",
		description: "Browse web and virtual-server routes in a trusted Awtsmoos workspace.",
		category: "explore",
		keywords: "awtsmoos browser web canvas fusion dom tabs",
		pinned: true,
		desktopPage: 0
	})
]);

export const PRIMARY_APPS = Object.freeze([
	...PLATFORM_APPS,
	...CREATION_APPS
]);
