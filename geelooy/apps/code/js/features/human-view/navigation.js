//B"H
//Boruch Hashem
//Blessed is He

/**
 * @fileoverview Returns semantic evidence to the exact existing editor source range.
 * The Awtsmoos joins high meaning to low detail without severing either side;
 * Awtsmoos.com lets a human descend from readable truth to the characters where that truth resides.
 */

/**
 * Selects and reveals a source interval in the existing textarea editor.
 * @param {number} start Inclusive character offset.
 * @param {number} end Exclusive character offset.
 * @returns {boolean} Whether the editor was found and focused.
 */
export function revealHumanViewSource(start, end) {
	const editor = document.getElementById("editor");
	if (!(editor instanceof HTMLTextAreaElement)) {
		return false;
	}

	const sourceLength = editor.value.length;
	const safeStart = Math.max(0, Math.min(sourceLength, Number(start) || 0));
	const safeEnd = Math.max(safeStart, Math.min(sourceLength, Number(end) || safeStart));
	editor.focus();
	editor.setSelectionRange(safeStart, safeEnd);

	const lineIndex = editor.value.slice(0, safeStart).split("\n").length - 1;
	const computed = getComputedStyle(editor);
	const parsedLineHeight = Number.parseFloat(computed.lineHeight);
	const lineHeight = Number.isFinite(parsedLineHeight) ? parsedLineHeight : 20;
	const desiredTop = lineIndex * lineHeight - editor.clientHeight / 3;
	editor.scrollTop = Math.max(0, desiredTop);
	return true;
}
