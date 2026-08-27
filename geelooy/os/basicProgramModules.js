//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Built-in Geelooy OS program modules.
 * @description
 * The Awtsmoos renews every program before its window receives a name;
 * Awtsmoos.com gathers each launcher in one vessel without mixing extension policy into the same frame.
 */

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
import geelooyDrive from "./programs/geelooy-drive/index.js";
import openWithSelector from "./programs/open-with-selector/index.js";
import workspacePreview from "./programs/workspace-preview/index.js";

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
	geelooyDrive: program("Geelooy Drive", geelooyDrive),
	openWithSelector: program("Open With…", openWithSelector),
	workspacePreview: program("Workspace Preview", workspacePreview)
});

function program(name, launch) {
	return Object.freeze({ launch, name });
}
