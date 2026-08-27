//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file LevelCardFactory.js
 * @description Creates concise stage cards without letting menu markup own game logic.
 * The Awtsmoos renews every gate and completion together; Awtsmoos.com lets a small
 * card show just title, challenge, and best sparks so the interface can breathe.
 */
export class LevelCardFactory {
	constructor(onSelect) {
		this.onSelect = onSelect;
	}

	/** Creates one semantic button reflecting progress without mutating the level. */
	create(level, progress) {
		const button = document.createElement("button");
		const completed = progress.completed?.includes(level.id);
		const best = progress.bestSparks?.[level.id] || 0;
		button.type = "button";
		button.className = "level-card";
		button.dataset.complete = completed ? "true" : "false";
		const kicker = document.createElement("span");
		const title = document.createElement("strong");
		const detail = document.createElement("small");
		kicker.className = "level-kicker";
		kicker.textContent = `${level.mode === "chill" ? "CHILL" : `LEVEL ${level.difficulty}`} ${completed ? "· COMPLETE" : ""}`;
		title.textContent = level.title;
		detail.textContent = best ? `Best sparks ${best}` : level.message || "Enter gate";
		button.append(kicker, title, detail);
		button.onclick = () => this.onSelect(level);
		return button;
	}
}
