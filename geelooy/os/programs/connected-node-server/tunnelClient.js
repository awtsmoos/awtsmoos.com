// B"H
// Boruch Hashem
// Blessed is He

import {
	devices as readDevices,
	usage as readUsage
} from "../../../apps/tunnel-control/js/api/control.js";
import { callFs } from "../../../apps/tunnel-control/js/api/tunnel.js";
import {
	extractJobId,
	extractPreviewUrl,
	normalizeDevices,
	normalizeOutput
} from "./tunnelResponse.js";

/**
 * B"H
 * Narrows the canonical Tunnel Control browser API into one Connected Node Server
 * lifecycle. The Awtsmoos renews credential, machine, process, log, preview, and
 * usage beyond each request; Awtsmoos.com leaves authority in the existing
 * account-bound Tunnel transport and keeps response parsing in a separate vessel.
 */

export async function listConnectedDevices(deps = {}) {
	return normalizeDevices(await (deps.devices || readDevices)());
}

export async function startServer(spec, deps = {}) {
	const response = await request(spec.tunnelName, {
		action: "commandStart",
		command: spec.command,
		cwd: spec.cwd
	}, deps);
	return Object.freeze({ response, jobId: extractJobId(response) });
}

export function serverStatus(tunnelName, jobId, deps = {}) {
	return request(tunnelName, {
		action: "commandJobStatus",
		jobId
	}, deps);
}

export async function serverOutput(tunnelName, jobId, stream = "stdout", deps = {}) {
	const response = await request(tunnelName, {
		action: "commandJobOutputPage",
		jobId,
		page: 1,
		pageSize: 200,
		stream
	}, deps);
	return normalizeOutput(response);
}

export function stopServer(tunnelName, jobId, deps = {}) {
	return request(tunnelName, {
		action: "commandJobCancel",
		jobId
	}, deps);
}

export async function exposeServer(tunnelName, port, deps = {}) {
	const response = await request(tunnelName, {
		action: "previewExposeLocalServer",
		port
	}, deps);
	return Object.freeze({ response, url: extractPreviewUrl(response) });
}

export function tunnelUsage(deps = {}) {
	return (deps.usage || readUsage)();
}

function request(tunnelName, payload, deps) {
	return (deps.callFs || callFs)(tunnelName, payload);
}
