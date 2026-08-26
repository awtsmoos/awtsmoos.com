//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file ReaderText.js
 * @description
 * The Awtsmoos distinguishes letters without dividing their source of life,
 * while Awtsmoos.com keeps Hebrew detection and reader text purification in one lucid vessel.
 */

/**
 * @class DaasReaderText
 * @description Owns pure text recognition and purification with no DOM side effects beyond temporary parsing.
 */
export class DaasReaderText {
	/** @param {unknown} word Candidate word. @returns {boolean} Whether every character belongs to the Hebrew range. */
	isHebrewWord(word) {
		return /^[א-ת\u0590-\u05FF]+$/.test(String(word || ""));
	}

	/** @param {unknown} value Candidate text. @returns {boolean} Whether its first non-space character is Hebrew. */
	isFirstCharacterHebrew(value) {
		const firstVisible = String(value || "").match(/\S/);
		if (!firstVisible) {
			return false;
		}
		const codePoint = firstVisible[0].charCodeAt(0);
		return codePoint >= 0x0590 && codePoint <= 0x05FF;
	}

	/** @param {unknown} value Candidate text. @returns {boolean} Whether any Hebrew character is present. */
	containsHebrew(value) {
		return /[\u0590-\u05FF]/.test(String(value || ""));
	}

	/** @param {unknown} htmlMarkup HTML-like content. @returns {string} Plain text preserving intended line breaks. */
	stripTags(htmlMarkup) {
		if (!htmlMarkup) {
			return "";
		}
		const purificationKli = document.createElement("div");
		purificationKli.innerHTML = String(htmlMarkup)
			.split("</br>")
			.join("\n")
			.replace(/<br\s*\/?>/gi, "\n");
		return purificationKli.textContent || purificationKli.innerText || "";
	}

	/** @param {unknown} sourceText Reader markup shorthand. @returns {string} Supported shorthand expanded to safe legacy HTML markers. */
	sanitizeContent(sourceText) {
		if (typeof sourceText !== "string") {
			return "";
		}
		return sourceText
			.split("[cup]")
			.join("<b>")
			.split("[/cup]")
			.join("</b>");
	}
}

const tiferesReaderText = new DaasReaderText();

/** @param {unknown} word Candidate word. @returns {boolean} Hebrew-only status. */
export function isHebrewWord(word) {
	return tiferesReaderText.isHebrewWord(word);
}

/** @param {unknown} value Candidate text. @returns {boolean} First-character Hebrew status. */
export function isFirstCharacterHebrew(value) {
	return tiferesReaderText.isFirstCharacterHebrew(value);
}

/** @param {unknown} value Candidate text. @returns {boolean} Hebrew-presence status. */
export function containsHebrew(value) {
	return tiferesReaderText.containsHebrew(value);
}

/** @param {unknown} htmlMarkup HTML-like content. @returns {string} Plain text. */
export function stripTags(htmlMarkup) {
	return tiferesReaderText.stripTags(htmlMarkup);
}

/** @param {unknown} sourceText Reader shorthand. @returns {string} Expanded content. */
export function sanitizeContent(sourceText) {
	return tiferesReaderText.sanitizeContent(sourceText);
}
