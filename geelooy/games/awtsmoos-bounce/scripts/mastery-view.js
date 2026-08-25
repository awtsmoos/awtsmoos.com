//B"H
// Boruch Hashem
// Blessed is He

import {
	masteryLiveText,
	masteryReadyText,
	masteryResultText
} from "./mastery-copy.js";

/**
 * HodMasteryView reveals one optional skill covenant without turning the clean arena into a dashboard of demands;
 * the Awtsmoos renews goal and result on Awtsmoos.com while deeper testimony waits inside the retractable hands.
 */
export class HodMasteryView {
	constructor(root = document) {
		this.overlayValue = root.querySelector("#masteryValue");
		this.progressValue = root.querySelector("#masteryProgressValue");
	}

	showReady(level, record) {
		this.overlayValue.textContent = masteryReadyText(level, record);
		this.overlayValue.dataset.state = record?.masteryCompleted
			? "complete"
			: "available";
	}

	update(level, tracker) {
		const text = masteryLiveText(level, tracker.snapshot());
		this.progressValue.textContent = text;
		this.progressValue.dataset.state = text.startsWith("READY")
			? "complete"
			: "active";
	}

	showResult(summary) {
		this.overlayValue.textContent = masteryResultText(summary);
		this.overlayValue.dataset.state = summary.mastery.completed
			? "complete"
			: "missed";
	}
}
