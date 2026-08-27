//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Canonical built-in Geelooy OS program modules.
 * @description
 * The Awtsmoos renews every program before a window receives its name;
 * Awtsmoos.com gathers every launch vessel here while extension policy, icons, and facade exports remain separate and clear.
 */

import advancedCodeEditor from "./programs/advanced-code-editor/index.js";
import awtsmoosBinaryViewer from "./programs/awtsmoos-binary-viewer/index.js";
import awtsmoosBrowser from "./programs/awtsmoos-browser/index.js";
import awtsmoosCommand from "./programs/awtsmoos-command/index.js";
import awtsmoosCompiler from "./programs/awtsmoos-compiler/index.js";
import awtsmoosDbExplorer from "./programs/awtsmoosdb-explorer/index.js";
import awtsmoosDiagnostics from "./programs/awtsmoos-diagnostics/index.js";
import awtsmoosDocs from "./programs/awtsmoos-docs/index.js";
import awtsmoosExecutable from "./programs/awtsmoos-executable/index.js";
import awtsmoosFileExplorer from "./programs/awtsmoos-file-explorer/index.js";
import awtsmoosPresenter from "./programs/awtsmoos-presenter/index.js";
import awtsmoosSheets from "./programs/awtsmoos-sheets/index.js";
import awtsmoosTaskManager from "./programs/awtsmoos-task-manager/index.js";
import awtsmoosTextEdit from "./programs/awtsmoos-text/index.js";
import connectedNodeServer from "./programs/connected-node-server/index.js";
import driveWorkspace from "./programs/drive-workspace/index.js";
import openWithSelector from "./programs/open-with-selector/index.js";
import perutaUsage from "./programs/peruta-usage/index.js";
import projectCommandCenter from "./programs/project-command-center/index.js";
import walletPortal from "./programs/wallet-portal/index.js";
import workspacePreview from "./programs/workspace-preview/index.js";

export const programs = Object.freeze({
	advancedCodeEditor: program("Advanced Code Editor", advancedCodeEditor),
	awtsmoosBinaryViewer: program("Binary Viewer", awtsmoosBinaryViewer),
	awtsmoosBrowser: program("Merkava Browser", awtsmoosBrowser),
	awtsmoosCommand: program("Command", awtsmoosCommand),
	awtsmoosCompiler: program("Awtsmoos Compiler", awtsmoosCompiler),
	awtsmoosDbExplorer: program("AwtsmoosDB Explorer", awtsmoosDbExplorer),
	awtsmoosDiagnostics: program("Developer Diagnostics", awtsmoosDiagnostics),
	awtsmoosDocs: program("Awtsmoos Docs", awtsmoosDocs),
	awtsmoosExecutable: program("Executable Host", awtsmoosExecutable),
	awtsmoosFileExplorer: program("File Explorer", awtsmoosFileExplorer),
	awtsmoosPresenter: program("Awtsmoos Slides", awtsmoosPresenter),
	awtsmoosSheets: program("Awtsmoos Sheets", awtsmoosSheets),
	awtsmoosTaskManager: program("Task Manager", awtsmoosTaskManager),
	awtsmoosTextEdit: program("Text Editor", awtsmoosTextEdit),
	connectedNodeServer: program("Connected Node Server", connectedNodeServer),
	driveWorkspace: program("Drive & Sites", driveWorkspace),
	openWithSelector: program("Open With…", openWithSelector),
	perutaUsage: program("Peruta Usage", perutaUsage),
	projectCommandCenter: program("Project Command Center", projectCommandCenter),
	walletPortal: program("Wallet", walletPortal),
	workspacePreview: program("Workspace Preview", workspacePreview)
});

function program(name, launch) {
	return Object.freeze({ launch, name });
}
