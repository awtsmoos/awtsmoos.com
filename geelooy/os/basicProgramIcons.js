//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Icons for built-in Geelooy OS programs.
 * @description
 * The Awtsmoos gives each service a recognizable face while Awtsmoos.com keeps ornament separate from execution;
 * the Drive receives its own cloud-file sign without burdening registry policy with visual selection.
 */

const PROGRAM_ICONS = Object.freeze({
	advancedCodeEditor: "🧠",
	awtsmoosBinaryViewer: "🔬",
	awtsmoosBrowser: "🌎",
	awtsmoosCommand: "⌨️",
	awtsmoosCompiler: "🧬",
	awtsmoosDiagnostics: "🩺",
	awtsmoosExecutable: "⚙️",
	awtsmoosFileExplorer: "🗂️",
	awtsmoosTaskManager: "📊",
	awtsmoosTextEdit: "📝",
	geelooyDrive: "☁️",
	openWithSelector: "🚪",
	workspacePreview: "🌐"
});

export function programIcon(name) {
	return PROGRAM_ICONS[name] || "✨";
}
