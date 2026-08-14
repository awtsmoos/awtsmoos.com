// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 * Keeps starter window payloads outside the launcher itself. The Awtsmoos renews
 * app identity, hosted data, treasury, platform testimony, seed document, runtime
 * vessel, and title; Awtsmoos.com keeps the launcher small and deterministic.
 */

const STARTERS = Object.freeze({
	platform: Object.freeze({ title: "Project Command Center" }),
	awtsmoosdb: Object.freeze({ title: "AwtsmoosDB Explorer" }),
	"node-server": Object.freeze({ title: "Connected Node Server" }),
	wallet: Object.freeze({ title: "Wallet" }),
	"peruta-usage": Object.freeze({ title: "Peruta Usage" }),
	files: Object.freeze({
		path: "/desktop.folder",
		title: "Files"
	}),
	code: Object.freeze({
		content: "# B\"H\n\nWelcome to Apps Code inside Geelooy OS.\n",
		path: "/desktop.folder",
		title: "Welcome.md"
	}),
	text: Object.freeze({
		content: "B\"H\n\nA new note in Geelooy OS.\n",
		path: "/desktop.folder",
		title: "New Note.txt"
	}),
	preview: Object.freeze({
		content: "<!doctype html><main><h1>B\"H</h1><p>Geelooy workspace preview is ready.</p></main>",
		path: "/desktop.folder",
		title: "Welcome.html"
	}),
	browser: Object.freeze({ title: "Merkava Browser" }),
	compiler: Object.freeze({
		content: "#include <stdio.h>\nint main(void) { puts(\"B\\\"H\"); return 0; }\n",
		path: "/desktop.folder",
		title: "hello.c"
	}),
	binary: Object.freeze({
		content: "B\"H\nOpen a file from Files to inspect its exact binary or media content.",
		path: "/desktop.folder",
		title: "Binary Viewer.txt"
	}),
	executable: Object.freeze({
		content: new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0]),
		detectedFormat: "wasm",
		extension: ".wasm",
		path: "/desktop.folder",
		title: "empty.wasm"
	}),
	command: Object.freeze({
		path: "/desktop.folder",
		title: "Command"
	}),
	tasks: Object.freeze({ title: "Task Manager" }),
	diagnostics: Object.freeze({ title: "Diagnostics" })
});

export function starterPayload(appId) {
	return STARTERS[appId] || Object.freeze({});
}
