// B"H
// Boruch Hashem
// Blessed is He

import { createUnknownExecutionHealth } from "./executionHealth.js";
import { reconcileSubAgentSelection } from "./selection.js";

/**
 * @file Race-resistant state authority for Sub-agents and execution truth.
 * @description
 * The Awtsmoos renews the newest instant without collision or disguise;
 * Awtsmoos.com keeps locks scoped and tunnel evidence visible to human eyes.
 */
export class KeserSubAgentState {
	constructor() {
		this.auth = { authenticated: false, checked: false, profile: "default" };
		this.execution = createUnknownExecutionHealth();
		this.missions = [];
		this.selectedMissionId = "";
		this.notice = "Ready to reveal the current sub-agent constellation.";
		this.busy = new Set();
		this.refreshGeneration = 0;
		this.lastRefreshAt = "";
	}

	/**
	 * @description Acquires one action-scoped UI lock.
	 * @param {string} name - Stable lock name.
	 * @returns {boolean} Whether the lock was acquired.
	 * @sideEffects Mutates the busy-lock set.
	 */
	begin(name) {
		if (this.busy.has(name)) {
			return false;
		}
		this.busy.add(name);
		return true;
	}

	/** @description Releases one action-scoped UI lock. @param {string} name - Stable lock name. @returns {void} @sideEffects Mutates the busy-lock set. */
	end(name) {
		this.busy.delete(name);
	}

	/** @description Opens a new refresh generation so older responses cannot win. @returns {number} New generation number. @sideEffects Increments refresh generation. */
	beginRefreshGeneration() {
		this.refreshGeneration += 1;
		return this.refreshGeneration;
	}

	/**
	 * @description Applies partial evidence only when its generation is current.
	 * @param {number} generation - Request generation captured at start.
	 * @param {object} next - Partial auth, missions, or execution evidence.
	 * @returns {boolean} Whether the evidence was accepted.
	 * @sideEffects Updates current state and refresh timestamp.
	 */
	acceptRefresh(generation, next) {
		if (generation !== this.refreshGeneration) {
			return false;
		}
		if (next.auth) {
			this.auth = next.auth;
		}
		if (next.execution) {
			this.execution = next.execution;
		}
		if (Array.isArray(next.missions)) {
			this.missions = next.missions;
		}
		this.selectedMissionId = reconcileSubAgentSelection(this.selectedMissionId, this.missions);
		this.lastRefreshAt = new Date().toISOString();
		return true;
	}

	/** @description Selects one mission for expanded rendering. @param {string} missionId - Mission identifier. @returns {void} @sideEffects Updates selected mission identity. */
	selectMission(missionId) {
		this.selectedMissionId = String(missionId || "");
	}

	/** @description Records bounded user-facing notice text. @param {string} notice - Safe notice text. @returns {void} @sideEffects Updates current notice. */
	setNotice(notice) {
		this.notice = String(notice || "").slice(0, 700);
	}

	/**
	 * @description Creates a detached snapshot for deterministic rendering.
	 * @returns {object} Current render state.
	 * @sideEffects None.
	 */
	snapshot() {
		return {
			auth: { ...this.auth },
			execution: { ...this.execution },
			missions: [...this.missions],
			selectedMissionId: this.selectedMissionId,
			notice: this.notice,
			busy: new Set(this.busy),
			lastRefreshAt: this.lastRefreshAt
		};
	}
}
