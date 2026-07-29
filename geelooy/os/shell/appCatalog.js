//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file appCatalog.js
 * @description
 * The Awtsmoos gives every registered program one public identity. Awtsmoos.com
 * lets desktop, dock, Start, and command search reveal the same real window stub.
 */

export const APP_CATEGORIES = Object.freeze([
	Object.freeze({ id: "create", title: "Create" }),
	Object.freeze({ id: "explore", title: "Explore" }),
	Object.freeze({ id: "system", title: "System" })
]);

export const APP_CATALOG = Object.freeze([
	app({
		id: "files", programName: "awtsmoosFileExplorer", title: "Files",
		icon: "🗂️", description: "Browse local, mounted, and remote files.",
		category: "explore", keywords: "folders drive vfs storage", pinned: true, desktopPage: 0
	}),
	app({
		id: "code", programName: "advancedCodeEditor", title: "Code",
		icon: "🧬", description: "Edit a workspace with the full Apps Code surface.",
		category: "create", keywords: "editor development source", pinned: true, desktopPage: 0
	}),
	app({
		id: "text", programName: "awtsmoosTextEdit", title: "Text Editor",
		icon: "📝", description: "Write notes and lightweight source files.",
		category: "create", keywords: "notes plain text document", desktopPage: 0
	}),
	app({
		id: "preview", programName: "workspacePreview", title: "Workspace Preview",
		icon: "🔭", description: "Preview HTML with adjacent workspace assets.",
		category: "create", keywords: "html web live preview", pinned: true, desktopPage: 0
	}),
	app({
		id: "browser", programName: "awtsmoosBrowser", title: "Merkava Browser",
		icon: "🌐", description: "Render bounded guest markup without an iframe.",
		category: "explore", keywords: "web canvas fusion dom", pinned: true, desktopPage: 0
	}),
	app({
		id: "compiler", programName: "awtsmoosCompiler", title: "Compiler",
		icon: "🛠️", description: "Compile a validated C or C++ project manifest.",
		category: "create", keywords: "c cpp native build", desktopPage: 2
	}),
	app({
		id: "binary", programName: "awtsmoosBinaryViewer", title: "Binary Viewer",
		icon: "🧿", description: "Inspect binary, image, media, and PDF content.",
		category: "explore", keywords: "blob bytes media inspect", desktopPage: 2
	}),
	app({
		id: "executable", programName: "awtsmoosExecutable", title: "Executable Host",
		icon: "🚀", description: "Run or inspect supported guest artifacts safely.",
		category: "system", keywords: "wasm exe apk runtime", desktopPage: 2
	}),
	app({
		id: "command", programName: "awtsmoosCommand", title: "Command",
		icon: "⌨️", description: "Operate the virtual filesystem from a shell.",
		category: "system", keywords: "terminal cli console", pinned: true, desktopPage: 3
	}),
	app({
		id: "tasks", programName: "awtsmoosTaskManager", title: "Task Manager",
		icon: "📊", description: "Inspect supervised programs, threads, and memory.",
		category: "system", keywords: "process telemetry performance", desktopPage: 3
	}),
	app({
		id: "diagnostics", programName: "awtsmoosDiagnostics", title: "Diagnostics",
		icon: "🧰", description: "Read graph events, adapters, drives, and mutations.",
		category: "system", keywords: "debug health graph logs", desktopPage: 3
	})
]);

export function appById(id) {
	return APP_CATALOG.find(item => item.id === id) || null;
}

export function appsForCategory(category) {
	return APP_CATALOG.filter(item => item.category === category);
}

export function pinnedApps() {
	return APP_CATALOG.filter(item => item.pinned);
}

function app(value) {
	return Object.freeze({
		pinned: false,
		desktopPage: null,
		keywords: "",
		...value
	});
}
