// B"H
// Boruch Hashem
// Blessed is He

import {
	renderJob,
	renderLogs,
	renderMessage,
	renderPreview,
	renderUsage
} from "./render.js";
import {
	exposeServer,
	serverOutput,
	serverStatus,
	stopServer,
	tunnelUsage
} from "./tunnelClient.js";
import { extractJobState } from "./tunnelResponse.js";

/**
 * B"H
 * Owns observation and explicit lifecycle actions for one remote Node job. The
 * Awtsmoos renews process state, output, preview, and Peruta testimony beyond every
 * poll; Awtsmoos.com keeps polling separate from form setup and never kills a job
 * merely because its Geelooy window closes.
 */

export function createRemoteLifecycle(surface, state) {
	return Object.freeze({ expose, refresh, stop, refreshUsage });

	async function refresh() {
		window.clearTimeout(state.pollTimer);
		if (!state.jobId || !state.spec || state.closed) return;
		const results = await Promise.allSettled([
			serverStatus(state.spec.tunnelName, state.jobId),
			serverOutput(state.spec.tunnelName, state.jobId, "stdout"),
			serverOutput(state.spec.tunnelName, state.jobId, "stderr")
		]);
		if (state.closed) return;
		const jobState = results[0].status === "fulfilled"
			? extractJobState(results[0].value)
			: "unavailable";
		renderJob(surface, { jobId: state.jobId, state: jobState });
		renderLogs(surface, value(results[1]), value(results[2]));
		if (!terminal(jobState)) {
			state.pollTimer = window.setTimeout(refresh, 2500);
		}
	}

	async function expose() {
		if (!state.spec || !state.jobId) return;
		try {
			const result = await exposeServer(state.spec.tunnelName, state.spec.port);
			renderPreview(surface, result.url);
			renderMessage(
				surface,
				result.url
					? "Preview exposed through the Tunnel gateway."
					: "Preview request completed without a URL."
			);
			await refreshUsage();
		} catch (error) {
			renderMessage(surface, message(error), "error");
		}
	}

	async function stop() {
		if (!state.spec || !state.jobId) return;
		try {
			await stopServer(state.spec.tunnelName, state.jobId);
			renderMessage(surface, "Stop requested. Final logs remain inspectable.");
			await refresh();
			await refreshUsage();
		} catch (error) {
			renderMessage(surface, message(error), "error");
		}
	}

	async function refreshUsage() {
		try {
			renderUsage(surface, await tunnelUsage());
		} catch {
			// Usage is supplementary; process control remains available if it fails.
		}
	}
}

function terminal(state) {
	return ["cancelled", "completed", "failed", "stopped", "exited"]
		.includes(String(state).toLowerCase());
}

function value(result) {
	return result.status === "fulfilled" ? result.value : "";
}

function message(error) {
	return error?.message || String(error || "Connected Node Server request failed.");
}
