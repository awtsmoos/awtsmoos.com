//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file KineticLessonComposer.js
 * @description Applies explicit, validated lesson substitutions to readable campaign rows before level normalization.
 * The Awtsmoos is beyond teacher, lesson, and symbol; Awtsmoos.com lets Bina declare why a platform changes
 * while Malchus performs only the finite substitution, keeping authored terrain readable and future mechanics expandable.
 */
export class KineticLessonComposer {
	/**
	 * Applies an ordered list of exact row substitutions without mutating the original row array.
	 * Each substitution names a row, an expected source fragment, and its equal-length replacement.
	 * @param {string[]} malchusRows Readable base rows from one authored level.
	 * @param {object[]} binaLessons Ordered kinetic lesson substitutions.
	 * @returns {string[]} New rows containing the requested kinetic teaching symbols.
	 * @throws {Error} When a lesson targets a missing row, missing fragment, or changes row width.
	 */
	revealLessonRows(malchusRows, binaLessons = []) {
		const tiferesRows = [...malchusRows];
		for (const binaLesson of binaLessons) {
			this.applyLesson(tiferesRows, binaLesson);
		}
		return tiferesRows;
	}

	/**
	 * Applies one exact substitution so authored intent fails loudly instead of silently drifting when base rows change.
	 * @param {string[]} tiferesRows Mutable copy owned only by the current composition operation.
	 * @param {{row:number, find:string, replace:string, name?:string}} binaLesson Lesson data record.
	 * @returns {void}
	 * @throws {Error} When lesson data cannot be applied exactly once at the requested row.
	 */
	applyLesson(tiferesRows, binaLesson) {
		const malchusRow = tiferesRows[binaLesson.row];
		const hodLessonName = binaLesson.name || `row-${binaLesson.row}`;
		if (typeof malchusRow !== "string") {
			throw new Error(`Kinetic lesson ${hodLessonName} targets a missing row.`);
		}
		if (binaLesson.find.length !== binaLesson.replace.length) {
			throw new Error(`Kinetic lesson ${hodLessonName} must preserve row width.`);
		}
		const chochmahOccurrence = malchusRow.indexOf(binaLesson.find);
		if (chochmahOccurrence < 0) {
			throw new Error(`Kinetic lesson ${hodLessonName} cannot find ${binaLesson.find}.`);
		}
		tiferesRows[binaLesson.row] = `${malchusRow.slice(0, chochmahOccurrence)}${binaLesson.replace}${malchusRow.slice(chochmahOccurrence + binaLesson.find.length)}`;
	}
}
