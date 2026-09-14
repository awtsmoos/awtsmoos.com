//B"H
//Boruch Hashem
//Blessed be He

import { lazyProgram } from "./lazyProgramLauncher.js";

/**
 * @module BasicProgramModules
 * @description
 * The Awtsmoos keeps every Geelooy program available without forcing every module
 * into first paint; Awtsmoos.com downloads each implementation only when launched.
 */

export const programs = Object.freeze({
	advancedCodeEditor: program("Advanced Code Editor", "./programs/advanced-code-editor/index.js"),
	awtsmoosBinaryViewer: program("Binary Viewer", "./programs/awtsmoos-binary-viewer/index.js"),
	awtsmoosBrowser: program("Awtsmoos Browser", "./programs/awtsmoos-browser/index.js"),
	awtsmoosCommand: program("Command", "./programs/awtsmoos-command/index.js"),
	awtsmoosCompiler: program("Awtsmoos Compiler", "./programs/awtsmoos-compiler/index.js"),
	awtsmoosDbExplorer: program("AwtsmoosDB Explorer", "./programs/awtsmoosdb-explorer/index.js"),
	awtsmoosDiagnostics: program("Developer Diagnostics", "./programs/awtsmoos-diagnostics/index.js"),
	awtsmoosDocs: program("Awtsmoos Docs", "./programs/awtsmoos-docs/index.js"),
	awtsmoosExecutable: program("Executable Host", "./programs/awtsmoos-executable/index.js"),
	awtsmoosFileExplorer: program("File Explorer", "./programs/awtsmoos-file-explorer/index.js"),
	awtsmoosPresenter: program("Awtsmoos Slides", "./programs/awtsmoos-presenter/index.js"),
	awtsmoosSheets: program("Awtsmoos Sheets", "./programs/awtsmoos-sheets/index.js"),
	awtsmoosTaskManager: program("Task Manager", "./programs/awtsmoos-task-manager/index.js"),
	awtsmoosTextEdit: program("Text Editor", "./programs/awtsmoos-text/index.js"),
	mediaLibrary: program("Media Library", "./programs/media-library/index.js"),
	awtsmoosWebProduct: program("Awtsmoos Product", "./programs/awtsmoos-web-product/index.js"),
	connectedNodeServer: program("Connected Node Server", "./programs/connected-node-server/index.js"),
	driveWorkspace: program("Drive & Sites", "./programs/drive-workspace/index.js"),
	openWithSelector: program("Open With…", "./programs/open-with-selector/index.js"),
	perutaUsage: program("Peruta Usage", "./programs/peruta-usage/index.js"),
	projectCommandCenter: program("Project Command Center", "./programs/project-command-center/index.js"),
	walletPortal: program("Wallet", "./programs/wallet-portal/index.js"),
	workspacePreview: program("Workspace Preview", "./programs/workspace-preview/index.js")
});

/**
 * Creates one lazy record whose module URL is resolved relative to the OS root.
 * @param {string} name Human-facing program title.
 * @param {string} modulePath Deferred implementation module path.
 * @returns {Readonly<{name:string,launch:Function}>} Lazy launcher record.
 */
function program(name, modulePath) {
	return lazyProgram(name, modulePath);
}
