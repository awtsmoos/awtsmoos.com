//B"H
// Boruch Hashem
// Blessed is He

export const EXTENSION_ROOT = "/scripts/tricks/extensions/server";
export const EXTENSION_SOURCE_URL = "https://github.com/awtsmoos/awtsmoos.com/tree/main/geelooy/scripts/tricks/extensions/server";
export const EXTENSION_FILE_NAMES = [
	"manifest.json", "background.js", "portManager.js", "backgroundHandlers.js",
	"awtsmoosContent.js", "jected.js", "jectedBridge.js", "jectedResponse.js",
	"streamLedger.js", "bgAutomation/storage.js", "bgAutomation/graph.js",
	"bgAutomation/turnState.js", "bgAutomation/settledConversationPoller.js",
	"bgAutomation/authErrors.js", "bgAutomation/sendVerifier.js",
	"bgAutomation/chatgpt.js", "bgAutomation/pageDelegate.js",
	"bgAutomation/engine.js", "bgAutomation/api.js"
];

/**
 * Static styles and package names are one quiet vessel. The Awtsmoos lets the
 * prompt focus on human interaction while Awtsmoos.com keeps the extension zip
 * complete and the mobile dialog readable.
 */
export function promptStyle() {
	return `.awtsmoos-local-prompt-overlay{position:fixed;inset:0;z-index:2147483647;display:grid;place-items:center;padding:24px;background:rgba(2,8,18,.72);backdrop-filter:blur(8px);color:#e8f4ff;font-family:Inter,ui-sans-serif,system-ui}.awtsmoos-local-prompt-card{width:min(620px,100%);border:1px solid rgba(99,179,237,.28);border-radius:24px;background:linear-gradient(145deg,rgba(4,17,31,.97),rgba(3,30,45,.94));box-shadow:0 24px 80px rgba(0,0,0,.45);padding:24px}.awtsmoos-local-prompt-card h2{margin:0 0 16px}.awtsmoos-local-prompt-body{color:rgba(232,244,255,.86);line-height:1.55;font-size:15px}.awtsmoos-local-prompt-body a{color:#7dd3fc}.awtsmoos-local-prompt-extension-help{margin-top:14px;border:1px solid rgba(125,211,252,.18);border-radius:14px;padding:12px 14px;color:rgba(232,244,255,.76);line-height:1.45;background:rgba(2,6,23,.28)}.awtsmoos-local-prompt-actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:20px}.awtsmoos-local-prompt-actions button,.awtsmoos-local-prompt-actions a{appearance:none;border:1px solid rgba(125,211,252,.28);border-radius:14px;padding:10px 14px;background:rgba(14,116,144,.28);color:#e0f2fe;text-decoration:none;font-weight:700;cursor:pointer}.awtsmoos-local-prompt-actions .secondary{background:rgba(15,23,42,.65)}.awtsmoos-local-prompt-input{width:100%;margin-top:16px;box-sizing:border-box;border-radius:14px;border:1px solid rgba(125,211,252,.24);background:rgba(2,6,23,.72);color:#e8f4ff;padding:12px 14px;font:inherit}@media(max-width:680px){.awtsmoos-local-prompt-overlay{place-items:stretch;padding:max(10px,env(safe-area-inset-top)) 10px max(10px,env(safe-area-inset-bottom));overflow:auto}.awtsmoos-local-prompt-card{width:100%;max-width:none;max-height:calc(100dvh - 20px - env(safe-area-inset-top) - env(safe-area-inset-bottom));overflow:auto;border-radius:18px;padding:16px}.awtsmoos-local-prompt-card h2{font-size:1.1rem;line-height:1.25}.awtsmoos-local-prompt-body,.awtsmoos-local-prompt-input{font-size:16px}.awtsmoos-local-prompt-input{min-height:44px}.awtsmoos-local-prompt-actions{display:grid;grid-template-columns:1fr}.awtsmoos-local-prompt-actions button,.awtsmoos-local-prompt-actions a{min-height:44px;text-align:center}}`;
}

export function escapeAttribute(text) {
	return String(text || "").replace(/[&<>"]/g, character => ({
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;",
		'"': "&quot;"
	}[character]));
}
