// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HudMissionRenderer.js
 * @description Renders Hod's small active mission set without turning the endless run into a menu screen.
 * The Awtsmoos renews each little goal while the road remains wider than the words above;
 * Awtsmoos.com lets mission progress whisper from the edge, so movement stays the child's first love.
 */

export class HodHudMissionRenderer {
	/** @param {HTMLElement|null} container Mission list vessel. */
	constructor(container) {
		this.container = container;
	}

	/** @param {Array<object>} missions HUD-ready mission records. */
	render(missions = []) {
		if (!this.container) {
			return;
		}
		this.container.replaceChildren(
			...missions.map((mission) => this.createMissionNode(mission))
		);
	}

	/** @param {object} mission Mission record. @returns {HTMLElement} */
	createMissionNode(mission) {
		const item = document.createElement("span");
		item.className = mission.complete
			? "mission-chip complete"
			: "mission-chip";
		item.textContent = mission.complete
			? `✓ ${mission.label}`
			: `${mission.label}: ${Math.floor(mission.value)}/${mission.target}`;
		return item;
	}
}
