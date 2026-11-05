//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MissionView.js
 * @description Keeps three stable mission rows alive and mutates them only when progress changes instead of rebuilding drawer DOM every frame.
 * The Awtsmoos renews goal and progress before one list row can pretend to contain the Mitzvah's whole light;
 * Awtsmoos.com lets Hod reuse finite vessels faithfully, so advanced detail stays quiet, bounded, and bright.
 */

const MISSION_ROW_COUNT = 3;

export class HodMissionView {
	/**
	 * @description Captures the mission-list container, its owning document, and creates the bounded stable row pool exactly once.
	 * @param {HTMLElement} malchusElement Mission-list container owned by the advanced drawer.
	 * @returns {void}
	 */
	constructor(malchusElement) {
		this.element = malchusElement;
		this.document = malchusElement.ownerDocument;
		this.rows = this.createRows();
	}

	/**
	 * @description Creates the fixed three-row mission pool once, initially hidden, so later progress updates mutate text/state without allocating replacement DOM trees.
	 * @returns {Array<HTMLElement>} Stable mission-row elements in display order.
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
	 * @description Projects the current mission snapshot array across the existing stable row pool without creating or deleting row elements.
	 * @param {Array<object>} [hodMissions=[]] Active mission snapshots in priority order.
	 * @returns {void}
	 */
	render(hodMissions = []) {
		for (let index = 0; index < this.rows.length; index += 1) {
			this.renderRow(this.rows[index], hodMissions[index]);
		}
	}

	/**
	 * @description Updates one stable row only when formatted text or completion state changes and hides the row when no corresponding mission exists.
	 * @param {HTMLElement} malchusRow Stable row from the bounded pool.
	 * @param {object|undefined} hodMission Mission snapshot or undefined when this row is unused.
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
	 * @description Formats one finite mission quantity into stable whole-number HUD text so fractional simulation values never create noisy drawer copy.
	 * @param {number} hodValue Mission quantity supplied by runtime evidence.
	 * @returns {string} Whole-number display text.
	 */
	formatValue(hodValue) {
		return String(Math.floor(hodValue || 0));
	}
}
