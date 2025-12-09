// B"H
// FILE: /Remember/awtsmoos.com/geelooy/os/basicPrograms.js

// --- IMPORTS ---
import awtsmoosTextEdit from "./programs/awtsmoos-text/index.js";
import awtsmoosFileExplorer from "./programs/awtsmoos-file-explorer/index.js";
import awtsmoosBinaryViewer from "./programs/awtsmoos-binary-viewer/index.js";
import openWithSelector from "./programs/open-with-selector/index.js";
import advancedCodeEditor from "./programs/advanced-code-editor/index.js";

// --- PROGRAM REGISTRY ---
export const programs = {
  awtsmoosTextEdit: {
    name: "Text Editor",
    launch: awtsmoosTextEdit
  },
  awtsmoosFileExplorer: {
    name: "File Explorer",
    launch: awtsmoosFileExplorer
  },
  awtsmoosBinaryViewer: {
    name: "Binary Viewer",
    launch: awtsmoosBinaryViewer
  },
  openWithSelector: {
    name: "Open With...",
    launch: openWithSelector
  },
  advancedCodeEditor: {
    name: "Advanced Code Editor",
    launch: advancedCodeEditor
  }
};

// --- COMPATIBILITY MAPPING ---
export const programsByExtension = {
  ".js": ["advancedCodeEditor", "awtsmoosTextEdit"],
  ".html": ["advancedCodeEditor", "awtsmoosTextEdit"],
  ".css": ["advancedCodeEditor", "awtsmoosTextEdit"],
  ".json": ["advancedCodeEditor", "awtsmoosTextEdit"],
  ".txt": ["awtsmoosTextEdit", "advancedCodeEditor"],
  ".folder": ["awtsmoosFileExplorer"]
};

// --- INITIAL DEFAULTS (SINGLE SOURCE OF TRUTH) ---
// B"H - Updated to prioritize Advanced Code Editor
export const initialDefaultPrograms = {
  ".js": "advancedCodeEditor",
  ".html": "advancedCodeEditor",
  ".css": "advancedCodeEditor",
  ".json": "advancedCodeEditor",
  ".txt": "awtsmoosTextEdit",
  ".folder": "awtsmoosFileExplorer"
};

// --- DYNAMIC SETTINGS ---
export let defaultPrograms = {};

// --- HELPER FUNCTION ---
export function getDefaultProgram(ext) {
	const progName = defaultPrograms[ext] || "awtsmoosBinaryViewer";
	return programs[progName].launch;	
}