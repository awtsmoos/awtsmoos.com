//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Creation-focused Geelooy OS application definitions.
 * @description
 * The Awtsmoos gathers project, code, preview, and compiler into a path from idea to form;
 * Awtsmoos.com lets a person begin with the site they mean to build, not infrastructure they must decode.
 */

export const CREATE_APPS = Object.freeze([
	app({
		id: "sites",
		programName: "geelooyDrive",
		title: "Sites",
		icon: "\u{1F3D7}\uFE0F",
		description: "Build, run, publish, and connect a website from one project workspace.",
		keywords: "projects websites drive publish runtime domains tunnel database git auth social",
		capabilityIds: ["files", "code", "preview", "publish", "runtime", "domains", "tunnel"],
		pinned: true,
		desktopPage: 0
	}),
	app({
		id: "code",
		programName: "advancedCodeEditor",
		title: "Code",
		icon: "\u{1F9EC}",
		description: "Edit a workspace with the full Apps Code surface.",
		keywords: "editor development source javascript html css markdown",
		capabilityIds: ["code"],
		pinned: true,
		desktopPage: 0
	}),
	app({
		id: "text",
		programName: "awtsmoosTextEdit",
		title: "Text Editor",
		icon: "\u{1F4DD}",
		description: "Write notes and lightweight source files.",
		keywords: "notes plain text document markdown",
		capabilityIds: ["files"],
		desktopPage: 0
	}),
	app({
		id: "preview",
		programName: "workspacePreview",
		title: "Workspace Preview",
		icon: "\u{1F52D}",
		description: "Preview HTML with adjacent workspace assets.",
		keywords: "html web live preview",
		capabilityIds: ["preview"],
		pinned: true,
		desktopPage: 0
	}),
	app({
		id: "compiler",
		programName: "awtsmoosCompiler",
		title: "Compiler",
		icon: "\u{1F6E0}\uFE0F",
		description: "Compile a validated C or C++ project manifest.",
		keywords: "c cpp native build",
		capabilityIds: ["code", "runtime"],
		desktopPage: 2
	})
]);

function app(value) {
	return Object.freeze({
		pinned: false,
		desktopPage: null,
		keywords: "",
		capabilityIds: [],
		category: "create",
		...value
	});
}
