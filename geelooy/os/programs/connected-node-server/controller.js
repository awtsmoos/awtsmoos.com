// B"H
// Boruch Hashem
// Blessed is He

import { createRemoteLifecycle } from "./lifecycle.js";
import {
	renderDevices,
	renderJob,
	renderMessage,
	renderUsage
} from "./render.js";
import { normalizeServerSpec } from "./spec.js";
import {
	listConnectedDevices,
	startServer,
	tunnelUsage
} from "./tunnelClient.js";

/**
 * B"H
 * Coordinates setup for one Connected Node Server while remote observation lives
 * in its own lifecycle vessel. The Awtsmoos renews form, account visibility,
 * machine, job, and Peruta beyond each submission; Awtsmoos.com does not confuse a
 * signed-out browser with a stopped native agent.
 */

export function createServerController(surface) {
	const state = { closed: false, jobId: "", pollTimer: 0, spec: null };
	const lifecycle = createRemoteLifecycle(surface, state);
	const listeners = [
		[surface.form, "submit", submit],
		[surface.refresh, "click", lifecycle.refresh],
		[surface.expose, "click", lifecycle.expose],
		[surface.stop, "click", lifecycle.stop]
	];
	for (const [target, event, handler] of listeners) {
		target.addEventListener(event, handler);
	}
	renderJob(surface);
	initialize();

	return Object.freeze({
		close() {
			state.closed = true;
			window.clearTimeout(state.pollTimer);
			for (const [target, event, handler] of listeners) {
				target.removeEventListener(event, handler);
			}
		}
	});

	async function initialize() {
		try {
			const [devices, usage] = await Promise.all([
				listConnectedDevices(),
				tunnelUsage()
			]);
			if (state.closed) return;
			renderDevices(surface, devices);
			renderUsage(surface, usage);
			renderMessage(
				surface,
				devices.length
					? "Choose an account-owned connected machine and project."
					: "No account-owned native machine is visible to this web session. Sign in, then start or reconnect the Awtsmoos Tunnel agent.",
				devices.length ? "info" : "warn"
			);
		} catch (error) {
			renderMessage(surface, message(error), "error");
		}
	}

	async function submit(event) {
		event.preventDefault();
		try {
			state.spec = readSpec(surface);
			renderMessage(surface, "Starting supervised Node process…");
			surface.start.disabled = true;
			const result = await startServer(state.spec);
			state.jobId = result.jobId;
			renderJob(surface, { jobId: state.jobId, state: "starting" });
			await lifecycle.refresh();
			await lifecycle.refreshUsage();
		} catch (error) {
			renderMessage(surface, message(error), "error");
		} finally {
			surface.start.disabled = false;
		}
	}
}

function readSpec(surface) {
	const option = surface.device.selectedOptions[0];
	return normalizeServerSpec({
		args: surface.args.value,
		cwd: surface.cwd.value,
		entry: surface.entry.value,
		platform: option?.dataset.platform,
		port: surface.port.value,
		tunnelName: surface.device.value
	});
}

function message(error) {
	return error?.message || String(error || "Connected Node Server request failed.");
}
