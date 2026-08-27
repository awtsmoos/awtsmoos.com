//B"H
// Boruch Hashem
// Blessed is He

import { findRuntimeServer } from "../core/runtimeServerMatch.js";
import { runtimeAvailable, runtimeUnavailableMessage } from "./runtimeEligibility.js";
import { HodOperationGuard } from "./operationGuard.js";
import {
	attachRecoveredRuntime,
	attachRuntimeExposure,
	attachRuntimeLogs,
	attachRuntimeServer,
	clearRuntimeState
} from "./runtimeState.js";

/**
 * @file Netzach managed-runtime orchestration for Geelooy Drive.
 * @description
 * The Awtsmoos gives a listener continuity while Awtsmoos.com remembers the immutable device route that owns it;
 * this service coordinates discovery, start, logs, exposure, and stop while eligibility and state transitions live elsewhere.
 */

export class NetzachRuntimeService {
	constructor(state, runtimeTransport) {
		this.state = state;
		this.runtime = runtimeTransport;
		this.guard = new HodOperationGuard(state);
	}

	async refreshExisting() {
		const snapshot = this.state.snapshot();
		if (!runtimeAvailable(this.state, this.runtime)
			|| !snapshot.mutationCredentialConfigured
			|| !snapshot.currentRoute) {
			return false;
		}
		const result = await this.guard.run(
			"Checking managed runtime…",
			() => this.runtime.list(snapshot.currentRoute)
		);
		if (result === false) return false;
		const server = findRuntimeServer(result.servers, snapshot.currentPath);
		attachRecoveredRuntime(this.state, snapshot.currentRoute, server);
		if (server) await this.refreshLogs();
		return server;
	}

	async startCurrentFolder() {
		const snapshot = this.state.snapshot();
		if (!runtimeAvailable(this.state, this.runtime)) {
			this.state.patch({ error: runtimeUnavailableMessage() });
			return false;
		}
		if (snapshot.runtimeServer) return snapshot.runtimeServer;
		const server = await this.guard.run(
			"Starting managed static server…",
			() => this.runtime.start(snapshot.currentRoute, snapshot.currentPath)
		);
		if (server === false) return false;
		attachRuntimeServer(this.state, snapshot.currentRoute, server);
		this.state.patch({ message: `Static server listening on device port ${server.port}.` });
		await this.refreshLogs();
		return server;
	}

	async exposePublic() {
		const snapshot = this.state.snapshot();
		if (!snapshot.runtimeServer) return false;
		const exposure = await this.guard.run(
			"Exposing managed server…",
			() => this.runtime.expose(
				snapshot.runtimeRoute,
				snapshot.runtimeServer,
				{ title: `Geelooy Runtime · ${snapshot.runtimeServer.path || snapshot.currentPath}` }
			)
		);
		if (exposure === false) return false;
		attachRuntimeExposure(this.state, exposure);
		this.state.patch({
			message: exposure.publicVerified
				? "Public runtime verified."
				: "Public runtime created; verification is still pending."
		});
		return exposure;
	}

	async refreshLogs() {
		const snapshot = this.state.snapshot();
		if (!snapshot.runtimeServer?.serverId) return [];
		const result = await this.guard.run(
			"Refreshing runtime logs…",
			() => this.runtime.logs(snapshot.runtimeRoute, snapshot.runtimeServer.serverId, 80)
		);
		if (result === false) return false;
		return attachRuntimeLogs(
			this.state,
			Array.isArray(result.logs) ? result.logs : []
		);
	}

	async stop() {
		const snapshot = this.state.snapshot();
		if (!snapshot.runtimeServer?.serverId) return false;
		const stopped = await this.guard.run(
			"Stopping managed static server…",
			() => this.runtime.stop(snapshot.runtimeRoute, snapshot.runtimeServer.serverId)
		);
		if (stopped === false) return false;
		clearRuntimeState(this.state);
		this.state.patch({ message: "Managed static server stopped." });
		return true;
	}
}
