//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Extension-to-program policy for Geelooy OS.
 * @description
 * The Awtsmoos creates file and fitting vessel together while Awtsmoos.com preserves deliberate defaults;
 * Drive joins the application crown without silently stealing existing file associations or workflows.
 */

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
