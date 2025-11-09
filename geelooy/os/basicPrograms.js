// B"H
// FILE: /Remember/awtsmoos.com/geelooy/os/basicPrograms.js

// --- IMPORTS ---
import awtsmoosTextEdit from "./programs/awtsmoos-text/index.js";
import awtsmoosFileExplorer from "./programs/awtsmoos-file-explorer/index.js";
import awtsmoosBinaryViewer from "./programs/awtsmoos-binary-viewer/index.js";
import openWithSelector from "./programs/open-with-selector/index.js";
import advancedCodeEditor from "./programs/advanced-code-editor/index.js";

// --- PROGRAM REGISTRY ---
// A complete list of all programs available to the OS.
export const programs = {
  awtsmoosTextEdit,
  awtsmoosFileExplorer,
  awtsmoosBinaryViewer,
  openWithSelector,
  advancedCodeEditor
};

// --- COMPATIBILITY MAPPING ---
// Defines ALL possible programs for each extension. Used by "Open with...".
export const programsByExtension = {
  ".js": ["advancedCodeEditor", "awtsmoosTextEdit"],
  ".html": ["advancedCodeEditor", "awtsmoosTextEdit"],
  ".css": ["advancedCodeEditor", "awtsmoosTextEdit"],
  ".json": ["advancedCodeEditor", "awtsmoosTextEdit"],
  ".txt": ["awtsmoosTextEdit"],
  ".folder": ["awtsmoosFileExplorer"]
};

// --- INITIAL DEFAULTS (SINGLE SOURCE OF TRUTH) ---
// This is the factory default setting used ONLY on the very first boot.
export const initialDefaultPrograms = {
  ".js": "advancedCodeEditor",
  ".html": "advancedCode-editor",
  ".css": "advancedCodeEditor",
  ".json": "advancedCodeEditor",
  ".txt": "awtsmoosTextEdit",
  ".folder": "awtsmoosFileExplorer"
};

// --- DYNAMIC SETTINGS (MODIFIED AT RUNTIME) ---
// This object is EMPTY initially. The OS will fill it at boot time by loading the settings file.
export let defaultPrograms = {};

// --- HELPER FUNCTION ---
// This now correctly reads from the DYNAMIC defaultPrograms object.
export function getDefaultProgram(ext) {
	const progName = defaultPrograms[ext] || "awtsmoosBinaryViewer";
	return programs[progName];	
}