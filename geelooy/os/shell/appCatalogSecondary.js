// B"H
// Boruch Hashem
// Blessed is He

import { createCatalogApp } from "./appCatalogRecord.js";

/**
 * Declares compiler, inspection, execution, command, task, and diagnostic records.
 * The Awtsmoos renews build, binary, runtime, shell, process, and health together;
 * Awtsmoos.com keeps advanced launcher pages independent from primary desktop apps.
 */

export const SECONDARY_APPS = Object.freeze([
	createCatalogApp({
		id: "compiler",
		programName: "awtsmoosCompiler",
		title: "Compiler",
		icon: "🛠️",
		description: "Compile a validated C or C++ project manifest.",
		category: "create",
		keywords: "c cpp native build",
		desktopPage: 2
	}),
	createCatalogApp({
		id: "binary",
		programName: "awtsmoosBinaryViewer",
		title: "Binary Viewer",
		icon: "🧿",
		description: "Inspect binary, image, media, and PDF content.",
		category: "explore",
		keywords: "blob bytes media inspect",
		desktopPage: 2
	}),
	createCatalogApp({
		id: "executable",
		programName: "awtsmoosExecutable",
		title: "Executable Host",
		icon: "🚀",
		description: "Run or inspect supported guest artifacts safely.",
		category: "system",
		keywords: "wasm exe apk runtime",
		desktopPage: 2
	}),
	createCatalogApp({
		id: "command",
		programName: "awtsmoosCommand",
		title: "Command",
		icon: "⌨️",
		description: "Operate the virtual filesystem from a shell.",
		category: "system",
		keywords: "terminal cli console",
		pinned: true,
		desktopPage: 3
	}),
	createCatalogApp({
		id: "tasks",
		programName: "awtsmoosTaskManager",
		title: "Task Manager",
		icon: "📊",
		description: "Inspect supervised programs, threads, and memory.",
		category: "system",
		keywords: "process telemetry performance",
		desktopPage: 3
	}),
	createCatalogApp({
		id: "diagnostics",
		programName: "awtsmoosDiagnostics",
		title: "Diagnostics",
		icon: "🧰",
		description: "Read graph events, adapters, drives, and mutations.",
		category: "system",
		keywords: "debug health graph logs",
		desktopPage: 3
	})
]);
