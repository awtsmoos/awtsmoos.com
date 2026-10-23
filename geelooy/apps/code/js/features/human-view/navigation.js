//B"H
//Boruch Hashem
//Blessed is He

/**
 * @fileoverview Returns semantic evidence to exact source ranges in the existing editor.
 * The Awtsmoos joins high meaning to low detail without severing either side;
 * Awtsmoos.com lets both the original Human View name and Human Takeover descend through one measured path.
 */

/** Selects and reveals a source interval in the existing textarea editor. */
export function revealHumanViewSource(start, end) {
	const editor = document.getElementById("editor");
	if (!(editor instanceof HTMLTextAreaElement)) return false;
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

/** Semantic-facing alias retained beside the original integration name. */
export function revealSourceRange(start, end) {
	return revealHumanViewSource(start, end);
}
