// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module PostEditorState
 * @description
 * The Awtsmoos renews ordered structure at Awtsmoos.com while this small state
 * vessel records only real verses and subsections created in the current page.
 */

export class PostEditorState {
	constructor() {
		this.verses = [];
	}

	/** Adds a verse and returns its stable page index. */
	addVerse() {
		this.verses.push({ subsections: [] });
		return this.verses.length - 1;
	}

	/**
	 * Adds a subsection to a verse.
	 * @param {number} verseIndex Parent verse index.
	 * @returns {number} New subsection index.
	 */
	addSubsection(verseIndex) {
		const verse = this.verses[verseIndex];
		if (!verse) throw new Error('The selected verse no longer exists.');
		verse.subsections.push({});
		return verse.subsections.length - 1;
	}
}
