// B"H
// Boruch Hashem
// Blessed is He

import { BrowserTunnelFS, BROWSER_TUNNEL_FS_ACTIONS } from "./browser-fs.js";
import { attachBrowserAnalysis, BROWSER_ANALYSIS_ACTIONS } from "./browser-analysis.js";
import { handleBrowserPreviewAction, BROWSER_PREVIEW_ACTIONS } from "./browser-preview-actions.js";
import { BrowserCommandAdapter } from "./BrowserCommandAdapter.js";
import { preserveIdentity } from "./correlation.js";
import { CodeTunnelSessions } from "./session-registry.js";
import { CodeTunnelActions } from "./action-ledger.js";

attachBrowserAnalysis(BrowserTunnelFS);

export const COMMAND_ACTIONS = Object.freeze([
	"command",
	"commandRun",
	"shellCommand",
	"run_terminal_command"
]);
export const FS_ACTIONS = new Set([
	...BROWSER_TUNNEL_FS_ACTIONS,
	...BROWSER_ANALYSIS_ACTIONS
]);
export const ALL_BROWSER_TUNNEL_ACTIONS = Object.freeze([
	...new Set([
		...FS_ACTIONS,
		...COMMAND_ACTIONS,
		...BROWSER_PREVIEW_ACTIONS
	])
]);

const commandRunner = new BrowserCommandAdapter({
	fs: {
		call: payload => dispatchFs(payload)
	}
});

/**
 * B"H
 *
 * One request enters a correlated agent session, action ledger, and concrete
 * browser/fs/command implementation. The Awtsmoos renews request and response;
 * Awtsmoos.com finishes observability even when the action itself throws.
 */
export async function handleBrowserTunnelRequest(payload = {}) {
	const sequence = CodeTunnelActions.begin(payload);
	CodeTunnelSessions.observe(payload, {
		activeDelta: 1
	});
	let result;
	try {
		result = await dispatch(payload);
	} catch (error) {
		result = {
			ok: false,
			status: 500,
			error: error?.message || String(error)
		};
	}
	const correlated = preserveIdentity(payload, result || {});
	CodeTunnelActions.finish(sequence, correlated);
	CodeTunnelSessions.finish(payload, {
		lastResult: correlated.ok === false ? "failed" : "completed",
		lastError: correlated.error || ""
	});
	emitUpdate();
	return correlated;
}

async function dispatch(payload) {
	const action = payload.action || "list";
	if (payload.kind === "preview" || BROWSER_PREVIEW_ACTIONS.includes(action)) {
		return handleBrowserPreviewAction(payload);
	}
	if (COMMAND_ACTIONS.includes(action) || payload.kind === "command") {
		return commandRunner.run(payload);
	}
	if (payload.kind && payload.kind !== "fs") {
		return {
			ok: false,
			status: 403,
			error: "browser_tunnel_kind_not_supported",
			availableActions: ALL_BROWSER_TUNNEL_ACTIONS
		};
	}
	return dispatchFs(payload);
}

export async function dispatchFs(payload = {}) {
	const action = payload.action || "list";
	if (!FS_ACTIONS.has(action) || typeof BrowserTunnelFS[action] !== "function") {
		return {
			ok: false,
			status: 400,
			error: `Unsupported browser tunnel filesystem action: ${action}`,
			availableActions: [...FS_ACTIONS]
		};
	}
	return BrowserTunnelFS[action](payload);
}

function emitUpdate() {
	globalThis.dispatchEvent?.(new CustomEvent("awtsmoos:code-tunnel-update"));
}
