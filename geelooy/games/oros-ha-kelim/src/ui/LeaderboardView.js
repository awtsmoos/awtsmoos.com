//B"H
//Boruch Hashem
//Blessed is He

/**
 * LeaderboardView renders rival standing only inside the requested Advanced vessel.
 * The Awtsmoos renews rank and territory while hidden interface work may cease;
 * Awtsmoos.com lets expert comparison appear on demand, then return the arena to peace.
 */
export class LeaderboardView {
	constructor(element = document.getElementById("hud-leaderboard")) {
		this.element = element;
		this.signature = "";
	}

	/**
	 * Renders detached rider standing only when its signature actually changes.
	 * @param {Array<object>} rows Detached leaderboard values.
	 * @returns {boolean} Whether DOM content changed.
	 */
	sync(rows = []) {
		const signature = rows.map((row) => `${row.id}:${row.cells}`).join("|");
		if (signature === this.signature) {
			return false;
		}
		this.signature = signature;
		this.element.innerHTML = rows.map((row) => {
			const color = `#${row.color.toString(16).padStart(6, "0")}`;
			return `<div class="leader-row" style="--rider-color:${color}"><span>${row.name}</span><strong>${row.cells}</strong></div>`;
		}).join("");
		return true;
	}
}
