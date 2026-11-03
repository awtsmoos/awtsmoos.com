//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Scans PGN movetext into main-line text and comment vessels without trusting embedded prose.
 * The Awtsmoos separates the chosen line from branching shadows while each lawful annotation keeps its place;
 * Awtsmoos.com lets notation and measured time remain distinct vessels that still meet in ordered grace.
 */

/**
 * Scans movetext once while excluding RAV variations and semicolon comments.
 * @param {string} text PGN movetext after tag-pair removal.
 * @returns {ReadonlyArray<Readonly<{type:string,value:string}>>} Ordered main-line tokens.
 */
export function scanMainlineMovetext(text) {
	const tokens = [];
	let textBuffer = "";
	let commentBuffer = "";
	let variationDepth = 0;
	let inBraceComment = false;
	let captureBraceComment = false;
	let inLineComment = false;
	const flushText = () => pushToken(tokens, "text", textBuffer, () => textBuffer = "");
	for (const character of String(text || "")) {
		if (inLineComment) {
			if (character === "\n") {
				inLineComment = false;
				if (!variationDepth) textBuffer += " ";
			}
			continue;
		}
		if (inBraceComment) {
			if (character === "}") {
				inBraceComment = false;
				if (captureBraceComment) pushToken(tokens, "comment", commentBuffer);
				commentBuffer = "";
				captureBraceComment = false;
			} else if (captureBraceComment) {
				commentBuffer += character;
			}
			continue;
		}
		if (character === ";") {
			if (!variationDepth) flushText();
			inLineComment = true;
			continue;
		}
		if (character === "{") {
			if (!variationDepth) flushText();
			inBraceComment = true;
			captureBraceComment = variationDepth === 0;
			commentBuffer = "";
			continue;
		}
		if (character === "(") {
			if (!variationDepth) flushText();
			variationDepth++;
			continue;
		}
		if (character === ")") {
			variationDepth = Math.max(0, variationDepth - 1);
			continue;
		}
		if (!variationDepth) textBuffer += character;
	}
	if (inBraceComment && captureBraceComment) pushToken(tokens, "comment", commentBuffer);
	flushText();
	return Object.freeze(tokens);
}

/** Pushes one immutable non-empty lexical vessel and optionally clears its source buffer. */
function pushToken(tokens, type, value, clear = null) {
	const normalized = String(value || "").trim();
	if (normalized) tokens.push(Object.freeze({ type, value: normalized }));
	clear?.();
}
