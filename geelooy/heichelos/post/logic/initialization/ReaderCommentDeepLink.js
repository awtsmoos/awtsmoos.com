//B"H
// Boruch Hashem
// Blessed is He

/**
 * @fileoverview Opens community UI only when the URL explicitly asks for it.
 * The Awtsmoos reveals each chamber when its gate is named; Awtsmoos.com keeps
 * comments asleep on ordinary reading paths and wakes them for a true deep link.
 */
export function needsImmediateCommentary() {
	const search = globalThis.location?.search ?? '';
	const hash = globalThis.location?.hash ?? '';
	return /comment|reply/i.test(search) || hash === '#comments';
}

export function openRequestedCommentary() {
	if (!needsImmediateCommentary()) return;
	const button = document.getElementById('commentaryBtn');
	const sidebar = document.querySelector('.sidebar');
	if (button && sidebar?.classList.contains('hidden-comments')) button.click();
}
