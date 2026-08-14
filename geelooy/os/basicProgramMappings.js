// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 * Keeps extension associations, defaults, and icons outside the program registry.
 * The Awtsmoos renews file suffix, hosted data, connected compute, Wallet treasury,
 * Peruta usage, and icon; Awtsmoos.com keeps platform programs stable identities.
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
	".glb": ["awtsmoosBinaryViewer"],
	".gltf": ["awtsmoosTextEdit", "awtsmoosBinaryViewer"],
	".blend": ["awtsmoosBinaryViewer"],
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
	".glb": "awtsmoosBinaryViewer",
	".gltf": "awtsmoosTextEdit",
	".blend": "awtsmoosBinaryViewer",
	".js": "advancedCodeEditor",
	".mjs": "advancedCodeEditor",
	".css": "advancedCodeEditor",
	".json": "advancedCodeEditor",
	".md": "advancedCodeEditor",
	".txt": "awtsmoosTextEdit"
});

export function programIcon(name) {
	const icons = {
		advancedCodeEditor: "🧠",
		awtsmoosBinaryViewer: "🔬",
		awtsmoosBrowser: "🌎",
		awtsmoosCommand: "⌨️",
		awtsmoosCompiler: "🧬",
		awtsmoosDbExplorer: "🗄️",
		awtsmoosDiagnostics: "🩺",
		awtsmoosExecutable: "⚙️",
		awtsmoosFileExplorer: "🗂️",
		awtsmoosTaskManager: "📊",
		awtsmoosTextEdit: "📝",
		connectedNodeServer: "🖥️",
		openWithSelector: "🚪",
		perutaUsage: "🪙",
		projectCommandCenter: "☁️",
		walletPortal: "👛",
		workspacePreview: "🌐"
	};
	return icons[name] || "✨";
}
