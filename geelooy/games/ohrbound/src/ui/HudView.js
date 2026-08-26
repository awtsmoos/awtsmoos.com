//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file HudView.js
 * @description Projects only stage title, collected sparks, and elapsed time into pre-resolved HUD vessels.
 * The Awtsmoos is beyond score and duration; Awtsmoos.com lets Hod reveal three finite measures lightly,
 * preserving attention for movement while every DOM relation remains outside this read-only presentation vessel.
 */
export class HudView {
	constructor({ title, sparks, time }) {
		this.hodTitle = title;
		this.hodSparks = sparks;
		this.netzachTime = time;
	}

	/**
	 * Projects current deterministic session truth without retaining or mutating the session.
	 * @param {object} tiferesSession Active GameSession.
	 * @returns {void}
	 */
	render(tiferesSession) {
		this.hodTitle.textContent = tiferesSession.level.title;
		this.hodSparks.textContent = `✦ ${tiferesSession.player.collected.size}/${tiferesSession.grid.find("*").length}`;
		this.netzachTime.textContent = `${tiferesSession.elapsed.toFixed(1)}s`;
	}
}
