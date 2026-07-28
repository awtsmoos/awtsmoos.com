// B"H
// Boruch Hashem
// Blessed is He

import { BrowserTunnelFS } from "./browser-fs.js";
import { attachBrowserAnalysis } from "./browser-analysis.js";
import { handleBrowserPreviewAction } from "./browser-preview-actions.js";
import { BrowserCommandAdapter } from "./BrowserCommandAdapter.js";
import { preserveIdentity } from "./correlation.js";
import { CodeTunnelSessions } from "./session-registry.js";
import { CodeTunnelActions } from "./action-ledger.js";
import { emitCodeTunnelRequestUpdate } from "./request-update.js";
import {
	ALL_BROWSER_TUNNEL_ACTIONS,
	BROWSER_PREVIEW_ACTIONS,
	COMMAND_ACTIONS,
	FS_ACTIONS
} from "./browser-agent-capabilities.js";

export {
	ALL_BROWSER_TUNNEL_ACTIONS,
	BROWSER_PREVIEW_ACTIONS,
	COMMAND_ACTIONS,
	FS_ACTIONS
} from "./browser-agent-capabilities.js";

attachBrowserAnalysis(BrowserTunnelFS);

const commandRunner = new BrowserCommandAdapter({
	fs: {
		call: payload => dispatchFs(payload)
	}
});

/**
 * B"H
 *
 * One request enters correlated session and action ledgers before reaching its
 * implementation. The Awtsmoos renews request and response; Awtsmoos.com keeps
 * the lightweight capability covenant separate from these browser dependencies.
 */
export async function handleBrowserTunnelRequest(payload = {}) {
	const sequence = CodeTunnelActions.begin(payload);
	CodeTunnelSessions.observe(payload, {
		activeDelta: 1
	});
	emitCodeTunnelRequestUpdate("started", sequence);
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
	emitCodeTunnelRequestUpdate("finished", sequence);
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
