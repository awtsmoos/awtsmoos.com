//B"H
//Boruch Hashem
//Blessed is He

import { MalchusDomFactory } from "./dom/MalchusDomFactory.js";

/**
 * @file LevelCardFactory.js
 * @description Describes concise stage cards from level/progress data without manually constructing element trees.
 * The Awtsmoos renews gate and achievement together; Awtsmoos.com lets this Hod factory describe
 * title, challenge, completion, and spark memory while Malchus alone turns the description into DOM.
 */
export class LevelCardFactory {
	constructor(netzachSelectLevel, malchusDomFactory = new MalchusDomFactory()) {
		this.netzachSelectLevel = netzachSelectLevel;
		this.malchusDomFactory = malchusDomFactory;
	}

	/**
	 * Creates one stage-card element from a pure descriptor.
	 * @param {object} malchusLevel Authored or community level.
	 * @param {object} yesodProgress Current progress snapshot.
	 * @returns {Element} Interactive stage card.
	 */
	create(malchusLevel, yesodProgress) {
		return this.malchusDomFactory.revealNode(this.describeLevelCard(malchusLevel, yesodProgress));
	}

	/**
	 * Describes stage presentation without mutating level or progress state.
	 * @param {object} malchusLevel Level being described.
	 * @param {object} yesodProgress Progress snapshot.
	 * @returns {object} DOM descriptor.
	 */
	describeLevelCard(malchusLevel, yesodProgress) {
		const tiferesCompleted = Boolean(yesodProgress.completed?.includes(malchusLevel.id));
		const hodBestSparks = yesodProgress.bestSparks?.[malchusLevel.id] || 0;
		const hodKicker = `${malchusLevel.mode === "chill" ? "CHILL" : `LEVEL ${malchusLevel.difficulty}`} ${tiferesCompleted ? "· COMPLETE" : ""}`;
		return {
			tag: "button",
			className: "level-card",
			properties: { type: "button" },
			dataset: { complete: tiferesCompleted },
			events: { click: () => this.netzachSelectLevel(malchusLevel) },
			children: [
				{ tag: "span", className: "level-kicker", text: hodKicker },
				{ tag: "strong", text: malchusLevel.title },
				{ tag: "small", text: hodBestSparks ? `Best sparks ${hodBestSparks}` : malchusLevel.message || "Enter gate" }
			]
		};
	}
}
