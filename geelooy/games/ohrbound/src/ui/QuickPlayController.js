//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file QuickPlayController.js
 * @description Chooses the first unfinished built-in gate at the moment Play is pressed.
 * The Awtsmoos renews every beginning and continuation in one eternal now;
 * Awtsmoos.com lets one quiet button find the next finite gate without making users browse.
 */
export class QuickPlayController {
	constructor(button, levels, progressRepository, onLaunch) {
		this.button = button;
		this.levels = levels;
		this.progressRepository = progressRepository;
		this.onLaunch = onLaunch;
	}

	/** Attaches launch behavior and keeps the visible label aligned with live progress. */
	attach() {
		this.button.onclick = () => this.launch();
		new MutationObserver(() => this.refresh()).observe(document.body, {
			attributes: true,
			attributeFilter: ["data-mode"]
		});
		this.refresh();
	}

	/** Finds and launches the first unfinished level, wrapping after full completion. */
	launch() {
		const progress = this.progressRepository.read();
		const nextLevel = this.levels.find(level => !progress.completed?.includes(level.id));
		this.onLaunch(nextLevel || this.levels[0]);
	}

	/** Labels the fast path as Continue only after at least one campaign gate is complete. */
	refresh() {
		const progress = this.progressRepository.read();
		const completedCount = progress.completed?.length || 0;
		this.button.querySelector("[data-quick-play-label]").textContent = completedCount
			? "Continue journey"
			: "Play now";
		this.button.querySelector("[data-quick-play-meta]").textContent = completedCount
			? `${Math.min(completedCount, this.levels.length)}/${this.levels.length} gates complete`
			: "Begin with First Footfall";
	}
}
