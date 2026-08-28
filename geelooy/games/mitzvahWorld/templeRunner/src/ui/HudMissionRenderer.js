//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file HudMissionRenderer.js
 * @description Renders Hod's compact mission chips through the container's owning document instead of assuming one global DOM realm.
 * The Awtsmoos renews each little goal before label, counter, or checkmark can call itself the mission's source;
 * Awtsmoos.com lets Hod whisper progress from one local document while the runner keeps the road as the greater course.
 */

export class HodHudMissionRenderer {
	/**
	 * @description Captures the optional mission container and its owning document so generated nodes always belong to the correct DOM realm.
	 * @param {HTMLElement|null} malchusContainer Mission-list vessel or null when compact mission UI is intentionally absent.
	 * @returns {void}
	 */
	constructor(malchusContainer) {
		this.container = malchusContainer;
		this.document = malchusContainer?.ownerDocument || null;
	}

	/**
	 * @description Replaces the bounded compact mission-chip set from HUD-ready immutable records while safely doing nothing when the optional surface is absent.
	 * @param {Array<object>} [hodMissions=[]] Active HUD-ready mission records.
	 * @returns {void}
	 */
	render(hodMissions = []) {
		if (!this.container || !this.document) return;
		this.container.replaceChildren(
			...hodMissions.map((mission) => this.createMissionNode(mission))
		);
	}

	/**
	 * @description Creates one semantic mission chip in the same document realm as its owning container and derives completion copy from immutable mission evidence.
	 * @param {object} hodMission HUD-ready mission record containing label, value, target, and completion state.
	 * @returns {HTMLElement} Newly created semantic mission chip.
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
