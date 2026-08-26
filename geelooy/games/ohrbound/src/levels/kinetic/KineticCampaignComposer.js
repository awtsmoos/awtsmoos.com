//B"H
//Boruch Hashem
//Blessed is He

import { defineLevel } from "../levelFactory.js";
import { revealKineticLesson } from "./KineticLessonCatalog.js";

/**
 * @file KineticCampaignComposer.js
 * @description Enriches readable base campaign maps with deterministic kinetic lessons at stable platform anchors.
 * The Awtsmoos is beyond map and motion; Awtsmoos.com lets Tiferes join Chochmah lesson intent to Malchus terrain,
 * preferring floating support before earthbound fallback so expansion stays teachable, deterministic, and complete.
 */
export class KineticCampaignComposer {
	/**
	 * Returns a new immutable level containing every lesson symbol declared for its pack/id.
	 * @param {object} malchusBaseLevel Existing normalized built-in level.
	 * @returns {object} Newly normalized kinetic lesson level, or the original level when no lesson is declared.
	 */
	revealLevel(malchusBaseLevel) {
		const binaLessonSymbols = revealKineticLesson(
			malchusBaseLevel.pack,
			malchusBaseLevel.id
		);
		if (!binaLessonSymbols.length) {
			return malchusBaseLevel;
		}
		const tiferesRows = [...malchusBaseLevel.rows];
		const yesodAnchors = this.revealPlatformAnchors(tiferesRows);
		if (yesodAnchors.length < binaLessonSymbols.length) {
			throw new Error(`${malchusBaseLevel.id} needs ${binaLessonSymbols.length} kinetic anchors but exposes ${yesodAnchors.length}.`);
		}
		for (let chochmahIndex = 0; chochmahIndex < binaLessonSymbols.length; chochmahIndex += 1) {
			this.revealSymbolAtAnchor(
				tiferesRows,
				yesodAnchors[chochmahIndex],
				binaLessonSymbols[chochmahIndex]
			);
		}
		return defineLevel({ ...malchusBaseLevel, rows: tiferesRows });
	}

	/**
	 * Finds stable platform-leading anchors in teaching order: floating clouds, floating stone, then ground runs.
	 * @param {string[]} malchusRows Normalized base rows.
	 * @returns {{row:number,column:number,source:string}[]} Ordered non-overlapping platform anchors.
	 */
	revealPlatformAnchors(malchusRows) {
		const binaFloatingRows = this.revealRowRange(malchusRows, false);
		const binaGroundRows = this.revealRowRange(malchusRows, true);
		return [
			...this.revealAnchorsForSource(malchusRows, binaFloatingRows, "="),
			...this.revealAnchorsForSource(malchusRows, binaFloatingRows, "#"),
			...this.revealAnchorsForSource(malchusRows, binaGroundRows, "#")
		];
	}

	/**
	 * Returns either non-ground authored row indexes or only the final ground row index.
	 * @param {string[]} malchusRows Normalized rows.
	 * @param {boolean} yesodGroundOnly Whether only the final row should be returned.
	 * @returns {number[]} Ordered row indexes.
	 */
	revealRowRange(malchusRows, yesodGroundOnly) {
		if (yesodGroundOnly) {
			return malchusRows.length ? [malchusRows.length - 1] : [];
		}
		return Array.from(
			{ length: Math.max(0, malchusRows.length - 2) },
			(_, chochmahIndex) => chochmahIndex + 1
		);
	}

	/**
	 * Finds the first cell of every contiguous support run for one symbol across selected rows.
	 * @param {string[]} malchusRows Normalized rows.
	 * @param {number[]} binaRowIndexes Candidate row indexes.
	 * @param {string} yesodSource Platform source symbol.
	 * @returns {{row:number,column:number,source:string}[]} Ordered anchors.
	 */
	revealAnchorsForSource(malchusRows, binaRowIndexes, yesodSource) {
		const binaAnchors = [];
		for (const malchusRowIndex of binaRowIndexes) {
			const malchusRow = malchusRows[malchusRowIndex];
			for (let malchusColumn = 0; malchusColumn < malchusRow.length; malchusColumn += 1) {
				if (malchusRow[malchusColumn] !== yesodSource) continue;
				if (malchusColumn > 0 && malchusRow[malchusColumn - 1] === yesodSource) continue;
				binaAnchors.push({ row: malchusRowIndex, column: malchusColumn, source: yesodSource });
			}
		}
		return binaAnchors;
	}

	/**
	 * Replaces exactly one support-leading tile while preserving width and neighboring coordinates.
	 * @param {string[]} tiferesRows Mutable campaign row copy.
	 * @param {{row:number,column:number}} yesodAnchor Selected platform anchor.
	 * @param {string} malchusSymbol Kinetic M/E/F/S symbol.
	 * @returns {void}
	 */
	revealSymbolAtAnchor(tiferesRows, yesodAnchor, malchusSymbol) {
		const hodRow = tiferesRows[yesodAnchor.row];
		tiferesRows[yesodAnchor.row] = `${hodRow.slice(0, yesodAnchor.column)}${malchusSymbol}${hodRow.slice(yesodAnchor.column + 1)}`;
	}

	/** Enriches an ordered pack without mutating imported base levels. @param {object[]} binaBaseLevels @returns {object[]} */
	revealPack(binaBaseLevels) {
		return binaBaseLevels.map(malchusLevel => this.revealLevel(malchusLevel));
	}
}
