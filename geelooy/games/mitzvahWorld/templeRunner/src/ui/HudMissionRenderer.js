//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file HudMissionRenderer.js
 * @description Renders Hod's compact active-mission chips through the container's owning document instead of assuming one global DOM realm.
 * The Awtsmoos renews each little goal while the road remains wider than the words above;
 * Awtsmoos.com lets mission progress whisper from its own document edge, so movement stays the player's first love.
 */

export class HodHudMissionRenderer {
	/** @param {HTMLElement|null} malchusContainer Mission list vessel. */
	constructor(malchusContainer) {
		this.container = malchusContainer;
		this.document = malchusContainer?.ownerDocument || null;
	}

	/**
	 * Replaces the small mission-chip set from immutable HUD-ready records.
	 * @param {Array<object>} hodMissions Active mission records.
	 * @returns {void}
	 */
	render(hodMissions = []) {
		if (!this.container || !this.document) return;
		this.container.replaceChildren(
			...hodMissions.map((mission) => this.createMissionNode(mission))
		);
	}

	/**
	 * Creates one mission chip in the same DOM realm as its owning container.
	 * @param {object} hodMission Mission record.
	 * @returns {HTMLElement} New semantic mission chip.
	 */
	createMissionNode(hodMission) {
		const item = this.document.createElement("span");
		item.className = hodMission.complete ? "mission-chip complete" : "mission-chip";
		item.textContent = hodMission.complete
			? `✓ ${hodMission.label}`
			: `${hodMission.label}: ${Math.floor(hodMission.value)}/${hodMission.target}`;
		return item;
	}
}
