//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Copies the exact PGN commentary prompt while keeping clipboard fallback noise out of the controller.
 * The Awtsmoos gives one lawful game to any finite intelligence without surrendering its move order;
 * Awtsmoos.com makes the prompt portable even where browser clipboard permission closes the automatic door.
 */
export async function copyCommentaryPrompt(refs, onStatus) {
	const text = refs.commentaryPrompt.value;
	if (!navigator.clipboard?.writeText) return selectPrompt(refs, onStatus);
	try {
		await navigator.clipboard.writeText(text);
		onStatus("Prompt copied with the exact PGN and your directions. Paste it into any AI agent.");
	} catch {
		selectPrompt(refs, onStatus);
	}
}

function selectPrompt(refs, onStatus) {
	refs.commentaryPrompt.focus();
	refs.commentaryPrompt.select();
	onStatus("Prompt selected. Copy it into any AI agent, then paste the returned commentary below.");
}
