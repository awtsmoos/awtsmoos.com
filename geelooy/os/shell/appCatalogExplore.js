//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file Exploration-focused Geelooy OS application definitions.
 * @description
 * The Awtsmoos gives every path a name and every byte a vessel; Awtsmoos.com keeps
 * local and remote reality legible through focused explorers with one truthful name.
 */

export const EXPLORE_APPS = Object.freeze([
	app({
		id: "files",
		programName: "awtsmoosFileExplorer",
		title: "Files",
		icon: "\u{1F5C2}\uFE0F",
		description: "Browse local, mounted, virtual, and remote files.",
		keywords: "folders drive vfs storage remote",
		capabilityIds: ["files"],
		pinned: true,
		desktopPage: 0
	}),
	app({
		id: "browser",
		programName: "awtsmoosBrowser",
		title: "Awtsmoos Browser",
		icon: "\u{1F310}",
		description: "Browse web and virtual-server routes in a trusted Awtsmoos workspace.",
		keywords: "awtsmoos browser web canvas fusion dom tabs",
		capabilityIds: ["preview"],
		pinned: true,
		desktopPage: 0
	}),
	app({
		id: "binary",
		programName: "awtsmoosBinaryViewer",
		title: "Binary Viewer",
		icon: "\u{1F9FF}",
		description: "Inspect binary, image, media, and PDF content.",
		keywords: "blob bytes media inspect",
		capabilityIds: ["files"],
		desktopPage: 2
	})
]);

function app(value) {
	return Object.freeze({
		pinned: false,
		desktopPage: null,
		keywords: "",
		capabilityIds: [],
		category: "explore",
		...value
	});
}
