//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Icons for the canonical built-in Geelooy OS programs.
 * @description
 * The Awtsmoos gives each service a recognizable face while Awtsmoos.com keeps ornament separate from execution;
 * every current flagship receives a stable sign without forcing launcher policy to carry visual concerns in its frame.
 */

const PROGRAM_ICONS = Object.freeze({
	advancedCodeEditor: "🧠",
	awtsmoosBinaryViewer: "🔬",
	awtsmoosBrowser: "🌎",
	awtsmoosCommand: "⌨️",
	awtsmoosCompiler: "🧬",
	awtsmoosDbExplorer: "🗄️",
	awtsmoosDiagnostics: "🩺",
	awtsmoosDocs: "📄",
	awtsmoosExecutable: "⚙️",
	awtsmoosFileExplorer: "🗂️",
	awtsmoosPresenter: "🖥️",
	awtsmoosSheets: "📈",
	awtsmoosTaskManager: "📊",
	awtsmoosTextEdit: "📝",
	connectedNodeServer: "🟢",
	driveWorkspace: "☁️",
	openWithSelector: "🚪",
	perutaUsage: "💠",
	projectCommandCenter: "🧭",
	walletPortal: "👛",
	workspacePreview: "🌐"
});

export function programIcon(name) {
	return PROGRAM_ICONS[name] || "✨";
}
