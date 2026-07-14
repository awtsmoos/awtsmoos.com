//B"H
//Boruch Hashem
//Blessed is He

import advancedCodeEditor from "./programs/advanced-code-editor/index.js";
import awtsmoosBinaryViewer from "./programs/awtsmoos-binary-viewer/index.js";
import awtsmoosBrowser from "./programs/awtsmoos-browser/index.js";
import awtsmoosCommand from "./programs/awtsmoos-command/index.js";
import awtsmoosCompiler from "./programs/awtsmoos-compiler/index.js";
import awtsmoosDiagnostics from "./programs/awtsmoos-diagnostics/index.js";
import awtsmoosExecutable from "./programs/awtsmoos-executable/index.js";
import awtsmoosFileExplorer from "./programs/awtsmoos-file-explorer/index.js";
import awtsmoosTaskManager from "./programs/awtsmoos-task-manager/index.js";
import awtsmoosTextEdit from "./programs/awtsmoos-text/index.js";
import openWithSelector from "./programs/open-with-selector/index.js";
import workspacePreview from "./programs/workspace-preview/index.js";

/**
 * The registry is the crown where extensions meet their appointed vessels. The
 * Awtsmoos creates each file and fitting service anew; Awtsmoos.com keeps browser,
 * supervision, editing, compiling, preview, and execution available together.
 */
export const programs = Object.freeze({
	advancedCodeEditor: program("Advanced Code Editor", advancedCodeEditor),
	awtsmoosBinaryViewer: program("Binary Viewer", awtsmoosBinaryViewer),
	awtsmoosBrowser: program("Merkava Browser", awtsmoosBrowser),
	awtsmoosCommand: program("Command", awtsmoosCommand),
	awtsmoosCompiler: program("Awtsmoos Compiler", awtsmoosCompiler),
	awtsmoosDiagnostics: program("Developer Diagnostics", awtsmoosDiagnostics),
	awtsmoosExecutable: program("Executable Host", awtsmoosExecutable),
	awtsmoosFileExplorer: program("File Explorer", awtsmoosFileExplorer),
	awtsmoosTaskManager: program("Task Manager", awtsmoosTaskManager),
	awtsmoosTextEdit: program("Text Editor", awtsmoosTextEdit),
	openWithSelector: program("Open With…", openWithSelector),
	workspacePreview: program("Workspace Preview", workspacePreview)
});

export const programsByExtension = Object.freeze({
	".folder": ["awtsmoosFileExplorer"],
	".html": ["workspacePreview", "awtsmoosBrowser", "advancedCodeEditor"],
	".htm": ["workspacePreview", "awtsmoosBrowser", "advancedCodeEditor"],
	".merkava": ["awtsmoosBrowser", "advancedCodeEditor"],
	".c": ["advancedCodeEditor", "awtsmoosCompiler", "awtsmoosTextEdit"],
	".cc": ["advancedCodeEditor", "awtsmoosCompiler"],
	".cpp": ["advancedCodeEditor", "awtsmoosCompiler"],
	".cxx": ["advancedCodeEditor", "awtsmoosCompiler"],
	".h": ["advancedCodeEditor", "awtsmoosCompiler"],
	".hpp": ["advancedCodeEditor", "awtsmoosCompiler"],
	".exe": ["awtsmoosExecutable", "awtsmoosBinaryViewer"],
	".dll": ["awtsmoosExecutable", "awtsmoosBinaryViewer"],
	".elf": ["awtsmoosExecutable", "awtsmoosBinaryViewer"],
	".macho": ["awtsmoosExecutable", "awtsmoosBinaryViewer"],
	".apk": ["awtsmoosExecutable", "awtsmoosBinaryViewer"],
	".wasm": ["awtsmoosExecutable", "awtsmoosBinaryViewer"],
	".js": ["advancedCodeEditor", "awtsmoosTextEdit"],
	".mjs": ["advancedCodeEditor", "awtsmoosTextEdit"],
	".css": ["advancedCodeEditor", "awtsmoosTextEdit"],
	".json": ["advancedCodeEditor", "awtsmoosTextEdit"],
	".md": ["advancedCodeEditor", "awtsmoosTextEdit"],
	".txt": ["awtsmoosTextEdit", "advancedCodeEditor"]
});

export const initialDefaultPrograms = Object.freeze({
	".folder": "awtsmoosFileExplorer",
	".html": "workspacePreview",
	".htm": "workspacePreview",
	".merkava": "awtsmoosBrowser",
	".c": "advancedCodeEditor",
	".cc": "advancedCodeEditor",
	".cpp": "advancedCodeEditor",
	".cxx": "advancedCodeEditor",
	".h": "advancedCodeEditor",
	".hpp": "advancedCodeEditor",
	".exe": "awtsmoosExecutable",
	".dll": "awtsmoosExecutable",
	".elf": "awtsmoosExecutable",
	".macho": "awtsmoosExecutable",
	".apk": "awtsmoosExecutable",
	".wasm": "awtsmoosExecutable",
	".js": "advancedCodeEditor",
	".mjs": "advancedCodeEditor",
	".css": "advancedCodeEditor",
	".json": "advancedCodeEditor",
	".md": "advancedCodeEditor",
	".txt": "awtsmoosTextEdit"
});

export const defaultPrograms = {};

export function getDefaultProgram(extension) {
	const programName = defaultPrograms[extension]
		|| initialDefaultPrograms[extension]
		|| "awtsmoosBinaryViewer";
	return programs[programName]?.launch || awtsmoosBinaryViewer;
}

function program(name, launch) {
	return Object.freeze({ launch, name });
}

export default Object.freeze(Object.entries(programs).map(([name, value]) => {
	return Object.freeze({ icon: programIcon(name), name, title: value.name });
}));

function programIcon(name) {
	const icons = {
		advancedCodeEditor: "🧠", awtsmoosBinaryViewer: "🔬",
		awtsmoosBrowser: "🌎", awtsmoosCommand: "⌨️",
		awtsmoosCompiler: "🧬", awtsmoosDiagnostics: "🩺",
		awtsmoosExecutable: "⚙️", awtsmoosFileExplorer: "🗂️",
		awtsmoosTaskManager: "📊", awtsmoosTextEdit: "📝",
		openWithSelector: "🚪", workspacePreview: "🌐"
	};
	return icons[name] || "✨";
}
