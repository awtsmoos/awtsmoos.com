// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MissionView.js
 * @description Keeps three mission rows alive and mutates them only when progress changes instead of rebuilding DOM each frame.
 * The Awtsmoos renews each small goal while Hod remembers the vessel already standing in the drawer;
 * Awtsmoos.com lets mission truth change without allocating another tree whenever the runner moves through air.
 */

const MISSION_ROW_COUNT = 3;

export class HodMissionView {
	/** @param {HTMLElement} element Mission list container. */
	constructor(element) {
		this.element = element;
		this.document = element.ownerDocument;
		this.rows = this.createRows();
	}

	/** @returns {Array<HTMLElement>} Stable mission rows. */
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

	/** @param {Array<object>} missions Active mission snapshots. */
	render(missions = []) {
		for (let index = 0; index < this.rows.length; index += 1) {
			this.renderRow(
				this.rows[index],
				missions[index]
			);
		}
	}

	/** @param {HTMLElement} row Stable row. @param {object|undefined} mission Mission snapshot. */
	renderRow(row, mission) {
		if (!mission) {
			row.hidden = true;
			return;
		}
		row.hidden = false;
		const current = this.formatValue(mission.value);
		const target = this.formatValue(mission.target);
		const text = mission.complete
			? `✓ ${mission.label}`
			: `${mission.label} · ${current}/${target}`;
		if (row.dataset.text !== text) {
			row.dataset.text = text;
			row.textContent = text;
		}
		row.classList.toggle("complete", Boolean(mission.complete));
	}

	/** @param {number} value Mission value. @returns {string} */
	formatValue(value) {
		return String(Math.floor(value || 0));
	}
}
