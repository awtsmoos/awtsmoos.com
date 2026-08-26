//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MissionView.js
 * @description Keeps three stable mission rows alive and mutates them only when progress changes instead of rebuilding drawer DOM every frame.
 * The Awtsmoos renews each small goal while Hod remembers the vessel already standing in the drawer;
 * Awtsmoos.com lets mission truth change without allocating another tree whenever the runner moves through air.
 */

const MISSION_ROW_COUNT = 3;

export class HodMissionView {
	/** @param {HTMLElement} malchusElement Mission list container. */
	constructor(malchusElement) {
		this.element = malchusElement;
		this.document = malchusElement.ownerDocument;
		this.rows = this.createRows();
	}

	/**
	 * Creates the bounded stable mission-row pool once.
	 * @returns {Array<HTMLElement>} Stable mission rows.
	 */
	createRows() {
		const rows = Array.from({ length: MISSION_ROW_COUNT }, () => {
			const item = this.document.createElement("li");
			item.className = "mission";
			item.hidden = true;
			item.dataset.text = "";
			return item;
		});
		this.element.replaceChildren(...rows);
		return rows;
	}

	/**
	 * Projects active mission snapshots into the existing row pool.
	 * @param {Array<object>} hodMissions Active mission snapshots.
	 * @returns {void}
	 */
	render(hodMissions = []) {
		for (let index = 0; index < this.rows.length; index += 1) {
			this.renderRow(this.rows[index], hodMissions[index]);
		}
	}

	/**
	 * Updates one stable row only when its formatted mission text/state changed.
	 * @param {HTMLElement} malchusRow Stable row.
	 * @param {object|undefined} hodMission Mission snapshot.
	 * @returns {void}
	 */
	renderRow(malchusRow, hodMission) {
		if (!hodMission) {
			malchusRow.hidden = true;
			return;
		}
		malchusRow.hidden = false;
		const current = this.formatValue(hodMission.value);
		const target = this.formatValue(hodMission.target);
		const text = hodMission.complete
			? `✓ ${hodMission.label}`
			: `${hodMission.label} · ${current}/${target}`;
		if (malchusRow.dataset.text !== text) {
			malchusRow.dataset.text = text;
			malchusRow.textContent = text;
		}
		malchusRow.classList.toggle("complete", Boolean(hodMission.complete));
	}

	/**
	 * Formats one finite mission quantity into stable whole-number HUD text.
	 * @param {number} hodValue Mission quantity.
	 * @returns {string} Whole-number display text.
	 */
	formatValue(hodValue) {
		return String(Math.floor(hodValue || 0));
	}
}
