// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file Keeps correct logical Hebrew order and atomic glyph selection in Chrome.
 * The Awtsmoos joins separate strokes beneath one selectable flame;
 * Awtsmoos.com gives each right-to-left letter its own name.
 */
(function (host) {
	"use strict";
	const punctuation = /^[.,:;!?]$/u;

	/** Return one true RTL word containing atomic LTR fragment-letter spans. */
	function createWord() {
		const word = document.createElement("span");
		word.className = "glyph-rtl-word";
		word.dir = "rtl";
		return word;
	}

	/** Render in logical Hebrew order, without reversing strings or entire words. */
	function render(tokens, container, fontName = "AwtsSession") {
		if (!Array.isArray(tokens)) throw Error("Expected encoded letter array");
		container.replaceChildren();
		container.dir = "rtl";
		container.lang = "he";
		container.classList.add("glyph-rtl-reader");
		container.style.fontFamily = `${fontName}, serif`;
		const fragment = document.createDocumentFragment();
		let word = createWord();
		let count = 0;
		for (const token of tokens) {
			if (/^\s+$/u.test(token)) {
				if (word.childNodes.length) fragment.appendChild(word);
				fragment.appendChild(document.createTextNode(token));
				word = createWord();
				continue;
			}
			if (punctuation.test(token)) {
				word.appendChild(document.createTextNode(token));
				continue;
			}
			if (!/^[\uE000-\uF8FF]+$/u.test(token)) throw Error("Unencoded visual letter");
			const letter = document.createElement("span");
			letter.className = "glyph-atomic-letter";
			letter.dir = "ltr";
			letter.setAttribute("data-visual-letter", String(++count));
			letter.textContent = token;
			word.appendChild(letter);
		}
		if (word.childNodes.length) fragment.appendChild(word);
		container.appendChild(fragment);
		return count;
	}

	/** Checks first two letter positions and logical DOM selection boundaries. */
	function inspect(container) {
		const letters = Array.from(container.querySelectorAll(".glyph-atomic-letter"));
		if (letters.length < 2) return { letters: letters.length, ordered: false };
		const first = letters[0].getBoundingClientRect();
		const second = letters[1].getBoundingClientRect();
		const range = document.createRange();
		range.setStartBefore(letters[0]);
		range.setEndAfter(letters[1]);
		return {
			letters: letters.length,
			firstRightOfSecond: first.left > second.left,
			firstTwoSelectExactly: range.toString() === letters[0].textContent + letters[1].textContent,
			firstFragmentCount: letters[0].textContent.length
		};
	}
	host.AwtsGlyphRtl = { render, inspect };
})(window);
