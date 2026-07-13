//B"H
//Boruch Hashem
//Blessed is He

import advancedCodeEditor from "./programs/advanced-code-editor/index.js";
import awtsmoosBinaryViewer from "./programs/awtsmoos-binary-viewer/index.js";
import awtsmoosCommand from "./programs/awtsmoos-command/index.js";
import awtsmoosCompiler from "./programs/awtsmoos-compiler/index.js";
import awtsmoosDiagnostics from "./programs/awtsmoos-diagnostics/index.js";
import awtsmoosExecutable from "./programs/awtsmoos-executable/index.js";
import awtsmoosFileExplorer from "./programs/awtsmoos-file-explorer/index.js";
import awtsmoosTextEdit from "./programs/awtsmoos-text/index.js";
import openWithSelector from "./programs/open-with-selector/index.js";
import workspacePreview from "./programs/workspace-preview/index.js";

/**
 * B"H
 * The registry is the crown where extensions meet their appointed vessels. The
 * Awtsmoos creates each file and its fitting service anew; Awtsmoos.com keeps
 * preview, editing, compiling, and execution distinct yet available together.
 */

export const programs = Object.freeze({
	advancedCodeEditor: program("Advanced Code Editor", advancedCodeEditor),
	awtsmoosBinaryViewer: program("Binary Viewer", awtsmoosBinaryViewer),
	awtsmoosCommand: program("Command", awtsmoosCommand),
	awtsmoosCompiler: program("Awtsmoos Compiler", awtsmoosCompiler),
	awtsmoosDiagnostics: program("Developer Diagnostics", awtsmoosDiagnostics),
	awtsmoosExecutable: program("Executable Simulator", awtsmoosExecutable),
	awtsmoosFileExplorer: program("File Explorer", awtsmoosFileExplorer),
	awtsmoosTextEdit: program("Text Editor", awtsmoosTextEdit),
	openWithSelector: program("Open With…", openWithSelector),
	workspacePreview: program("Workspace Preview", workspacePreview)
});

export const programsByExtension = Object.freeze({
	".folder": ["awtsmoosFileExplorer"],
	".html": ["workspacePreview", "advancedCodeEditor", "awtsmoosTextEdit"],
	".htm": ["workspacePreview", "advancedCodeEditor"],
	".c": ["advancedCodeEditor", "awtsmoosCompiler", "awtsmoosTextEdit"],
	".cc": ["advancedCodeEditor", "awtsmoosCompiler"],
	".cpp": ["advancedCodeEditor", "awtsmoosCompiler"],
	".cxx": ["advancedCodeEditor", "awtsmoosCompiler"],
	".h": ["advancedCodeEditor", "awtsmoosCompiler"],
	".hh": ["advancedCodeEditor", "awtsmoosCompiler"],
	".hpp": ["advancedCodeEditor", "awtsmoosCompiler"],
	".hxx": ["advancedCodeEditor", "awtsmoosCompiler"],
	".exe": ["awtsmoosExecutable", "awtsmoosBinaryViewer"],
	".dll": ["awtsmoosExecutable", "awtsmoosBinaryViewer"],
	".awtexe": ["awtsmoosExecutable", "awtsmoosBinaryViewer"],
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
	".c": "advancedCodeEditor",
	".cc": "advancedCodeEditor",
	".cpp": "advancedCodeEditor",
	".cxx": "advancedCodeEditor",
	".h": "advancedCodeEditor",
	".hh": "advancedCodeEditor",
	".hpp": "advancedCodeEditor",
	".hxx": "advancedCodeEditor",
	".exe": "awtsmoosExecutable",
	".dll": "awtsmoosExecutable",
	".awtexe": "awtsmoosExecutable",
	".wasm": "awtsmoosExecutable",
	".js": "advancedCodeEditor",
	".mjs": "advancedCodeEditor",
	".css": "advancedCodeEditor",
	".json": "advancedCodeEditor",
	".md": "advancedCodeEditor",
	".txt": "awtsmoosTextEdit"
});

export const defaultPrograms = {};

/** Resolves a configured launcher and falls back to the binary viewer. */
export function getDefaultProgram(extension) {
	const programName = defaultPrograms[extension]
		|| initialDefaultPrograms[extension]
		|| "awtsmoosBinaryViewer";
	return programs[programName]?.launch || awtsmoosBinaryViewer;
}

function program(name, launch) {
	return Object.freeze({ name, launch });
}
