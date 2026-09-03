// B"H
// Boruch Hashem
// Blessed is He

import { createUnknownExecutionHealth } from "./executionHealth.js";
import { reconcileSubAgentSelection } from "./selection.js";

/**
 * @file Race-resistant state authority for Sub-agents, shared browser auth, and execution truth.
 * @description
 * The Awtsmoos renews the newest instant without collision or disguise;
 * Awtsmoos.com keeps locks scoped while browser, login, and tunnel evidence remain visible to human eyes.
 */
export class KeserSubAgentState {
	constructor() {
		this.auth = unknownAuth();
		this.execution = createUnknownExecutionHealth();
		this.missions = [];
		this.selectedMissionId = "";
		this.notice = "Ready to reveal the current sub-agent constellation.";
		this.busy = new Set();
		this.refreshGeneration = 0;
		this.lastRefreshAt = "";
	}

	begin(name) {
		if (this.busy.has(name)) return false;
		this.busy.add(name);
		return true;
	}

	end(name) {
		this.busy.delete(name);
	}

	beginRefreshGeneration() {
		this.refreshGeneration += 1;
		return this.refreshGeneration;
	}

	acceptRefresh(generation, next) {
		if (generation !== this.refreshGeneration) return false;
		if (next.auth) this.auth = next.auth;
		if (next.execution) this.execution = next.execution;
		if (Array.isArray(next.missions)) this.missions = next.missions;
		this.selectedMissionId = reconcileSubAgentSelection(
			this.selectedMissionId,
			this.missions
		);
		this.lastRefreshAt = new Date().toISOString();
		return true;
	}

	selectMission(missionId) {
		this.selectedMissionId = String(missionId || "");
	}

	setNotice(notice) {
		this.notice = String(notice || "").slice(0, 700);
	}

	snapshot() {
		return {
			auth: { ...this.auth, browser: { ...this.auth.browser } },
			execution: { ...this.execution },
			missions: [...this.missions],
			selectedMissionId: this.selectedMissionId,
			notice: this.notice,
			busy: new Set(this.busy),
			lastRefreshAt: this.lastRefreshAt
		};
	}
}

function unknownAuth() {
	return {
		authenticated: false,
		checked: false,
		authKnown: false,
		needsManualLogin: false,
		browser: {
			id: "shared-ai-browser",
			label: "Shared AI Browser",
			ready: false,
			state: "unknown",
			sharedAcrossAgents: true
		}
	};
}
