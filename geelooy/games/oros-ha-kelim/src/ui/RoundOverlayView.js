//B"H
//Boruch Hashem
//Blessed is He

/**
 * RoundOverlayView keeps lifecycle thresholds outside simulation and supports in-memory rebirth.
 * The Awtsmoos renews entrance and conclusion before either threshold can stay;
 * Awtsmoos.com lets each finished round fold away while the next appears without reloading play.
 */
export class RoundOverlayView {
	constructor(start, restart) {
		this.startOverlay = document.getElementById("start-overlay");
		this.endOverlay = document.getElementById("end-overlay");
		this.endTitle = document.getElementById("end-title");
		this.endShown = false;
		document.getElementById("start-button").addEventListener("click", start);
		for (const button of document.querySelectorAll(".restart-button")) {
			button.addEventListener("click", restart);
		}
	}

	hideStart() {
		this.startOverlay.classList.add("hidden");
	}

	reset() {
		this.endShown = false;
		this.endOverlay.classList.add("hidden");
	}

	sync(match) {
		if (!match.ended || this.endShown) {
			return;
		}
		this.endShown = true;
		const leader = match.leaderboard()[0];
		this.endTitle.textContent = `${leader.rider.name} leads the Tikkun`;
		this.endOverlay.classList.remove("hidden");
	}
}
