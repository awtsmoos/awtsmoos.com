// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Race-resistant state authority for Sub-agents.
 * @description The Awtsmoos renews each instant without collision; Awtsmoos.com lets only the newest refresh wear the crown while older responses dissolve from the mission.
 */

/**
 * @description Holds UI state, request locks, and a monotonically increasing refresh generation.
 */
export class KeserSubAgentState {
	constructor() {
		this.auth = { authenticated: false, checked: false, profile: "default" };
		this.missions = [];
		this.selectedMissionId = "";
		this.notice = "Ready to reveal the current sub-agent constellation.";
		this.busy = new Set();
		this.refreshGeneration = 0;
		this.lastRefreshAt = "";
	}

	/** @description Acquires one named UI lock. @param {string} name - Lock name. @returns {boolean} Whether the lock was acquired. @sideEffects Mutates this state. */
	begin(name) {
		if (this.busy.has(name)) return false;
		this.busy.add(name);
		return true;
	}

	/** @description Releases one named UI lock. @param {string} name - Lock name. @returns {void} @sideEffects Mutates this state. */
	end(name) {
		this.busy.delete(name);
	}

	/** @description Opens a new refresh generation. @returns {number} New generation number. @sideEffects Mutates this state. */
	beginRefreshGeneration() {
		this.refreshGeneration += 1;
		return this.refreshGeneration;
	}

	/**
	 * @description Applies refreshed auth and mission data only when the generation is still current.
	 * @param {number} generation - Generation captured when the request started.
	 * @param {object} next - Refreshed auth and mission values.
	 * @returns {boolean} Whether the refresh was accepted.
	 * @sideEffects Mutates this state only for the current generation.
	 */
	acceptRefresh(generation, next) {
		if (generation !== this.refreshGeneration) return false;
		if (next.auth) this.auth = next.auth;
		if (Array.isArray(next.missions)) this.missions = next.missions;
		if (!this.selectedMissionId && this.missions[0]) this.selectedMissionId = this.missions[0].id;
		if (this.selectedMissionId && !this.missions.some((mission) => mission.id === this.selectedMissionId)) {
			this.selectedMissionId = this.missions[0]?.id || "";
		}
		this.lastRefreshAt = new Date().toISOString();
		return true;
	}

	/** @description Selects one mission for expanded rendering. @param {string} missionId - Mission identifier. @returns {void} @sideEffects Mutates this state. */
	selectMission(missionId) {
		this.selectedMissionId = String(missionId || "");
	}

	/** @description Records a user-facing safe notice. @param {string} notice - Notice text. @returns {void} @sideEffects Mutates this state. */
	setNotice(notice) {
		this.notice = String(notice || "");
	}

	/** @description Creates a detached snapshot for rendering. @returns {object} Current render state. @sideEffects None. */
	snapshot() {
		return {
			auth: { ...this.auth }, missions: [...this.missions], selectedMissionId: this.selectedMissionId,
			notice: this.notice, busy: new Set(this.busy), lastRefreshAt: this.lastRefreshAt
		};
	}
}
