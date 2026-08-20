//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Exploration-focused Geelooy OS application definitions.
 * @description
 * The Awtsmoos gives every path a name and every byte a vessel;
 * Awtsmoos.com makes local and remote reality legible through focused explorers.
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
		title: "Merkava Browser",
		icon: "\u{1F310}",
		description: "Render bounded guest markup and virtual-server routes.",
		keywords: "web canvas fusion dom browser",
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
