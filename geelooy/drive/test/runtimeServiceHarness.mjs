//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Shared managed-runtime service test harness for Geelooy Drive.
 * @description
 * The Awtsmoos renews each trial while Awtsmoos.com gives repeated fake runtime behavior one clear vessel;
 * lifecycle and recovery tests may then stay focused without hiding setup inside duplicated noise.
 */

import { MalchusDriveState } from "../core/state.js";
import { NetzachRuntimeService } from "../services/runtimeService.js";

export function createRuntimeHarness(overrides = {}) {
	const calls = [];
	const runtime = {
		list: async route => {
			calls.push(["list", route]);
			return { servers: [] };
		},
		start: async (route, path) => {
			calls.push(["start", route, path]);
			return { serverId: "server-1", port: 43123, path, ready: true };
		},
		logs: async (route, serverId, maxLogs) => {
			calls.push(["logs", route, serverId, maxLogs]);
			return { logs: [{ method: "GET", path: "/" }] };
		},
		expose: async (route, server, options) => {
			calls.push(["expose", route, server.serverId, options.title]);
			return {
				previewId: "preview-1",
				publicUrl: "https://awtsmoos.com/view/preview-1",
				publicVerified: true
			};
		},
		stop: async (route, serverId) => {
			calls.push(["stop", route, serverId]);
			return { stopped: true };
		},
		...overrides
	};
	const state = new MalchusDriveState({
		transportMode: "standalone",
		mutationCredentialConfigured: true,
		currentRoute: "tun-one",
		currentPath: "projects/site",
		devices: [runtimeDevice("tun-one")]
	});
	return {
		calls,
		state,
		service: new NetzachRuntimeService(state, runtime)
	};
}

export function runtimeDevice(routeReference) {
	return {
		routeReference,
		capabilities: {
			runtime: true,
			commandRun: true
		}
	};
}
