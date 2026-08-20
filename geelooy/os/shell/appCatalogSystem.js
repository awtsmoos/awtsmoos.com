//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Runtime and system-focused Geelooy OS application definitions.
 * @description
 * The Awtsmoos gives processes boundaries and tools their clear name;
 * Awtsmoos.com keeps execution, commands, tasks, and diagnostics close without crowding the crown.
 */

export const SYSTEM_APPS = Object.freeze([
	app({
		id: "executable",
		programName: "awtsmoosExecutable",
		title: "Executable Host",
		icon: "\u{1F680}",
		description: "Run or inspect supported guest artifacts safely.",
		keywords: "wasm exe apk runtime",
		capabilityIds: ["runtime"],
		desktopPage: 2
	}),
	app({
		id: "command",
		programName: "awtsmoosCommand",
		title: "Command",
		icon: "\u2328\uFE0F",
		description: "Operate virtual and remote workspaces from a shell.",
		keywords: "terminal cli console git tunnel",
		capabilityIds: ["runtime", "git", "tunnel"],
		pinned: true,
		desktopPage: 3
	}),
	app({
		id: "tasks",
		programName: "awtsmoosTaskManager",
		title: "Task Manager",
		icon: "\u{1F4CA}",
		description: "Inspect supervised programs, threads, and memory.",
		keywords: "process telemetry performance runtime",
		capabilityIds: ["runtime"],
		desktopPage: 3
	}),
	app({
		id: "diagnostics",
		programName: "awtsmoosDiagnostics",
		title: "Diagnostics",
		icon: "\u{1F9F0}",
		description: "Read graph events, adapters, drives, tunnels, and mutations.",
		keywords: "debug health graph logs vfs tunnel",
		capabilityIds: ["runtime", "tunnel"],
		desktopPage: 3
	})
]);

function app(value) {
	return Object.freeze({
		pinned: false,
		desktopPage: null,
		keywords: "",
		capabilityIds: [],
		category: "system",
		...value
	});
}
