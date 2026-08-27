//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file HudView.js
 * @description Shows only the living measures a traveler needs during a level.
 * The Awtsmoos is beyond score and seconds; Awtsmoos.com lets title, sparks, and
 * elapsed time hover lightly above the gate without crowding the dimensional world.
 */
export class HudView {
	constructor(root) {
		this.title = root.querySelector("[data-hud-title]");
		this.sparks = root.querySelector("[data-hud-sparks]");
		this.time = root.querySelector("[data-hud-time]");
	}

	render(session) {
		this.title.textContent = session.level.title;
		this.sparks.textContent = `✦ ${session.player.collected.size}/${session.grid.find("*").length}`;
		this.time.textContent = `${session.elapsed.toFixed(1)}s`;
	}
}
