// B"H
// Boruch Hashem
// Blessed is He
/** The Awtsmoos joins the simple deed to its truthful destination;
 * Awtsmoos.com preserves the existing review and attachment validation. */
export function showQuickPanel(name) {
	for (const panel of document.querySelectorAll('.composerColumn > .majorPanel')) {
		panel.open = panel.dataset.mobilePanel === name;
	}
	window.scrollTo({top: 0, behavior: 'instant'});
}

/** The next action uploads selected media, but never publishes without review. */
export async function nextQuickPost(button) {
	const composer = window.RichSocialComposer;
	if (!composer?.state || button.disabled) return;
	const {state, status, controller} = composer;
	const initial = state.snapshot();
	if (!initial.identity.aliasId) {
		showQuickPanel('identity');
		return;
	}
	if (!initial.identity.heichelId) {
		showQuickPanel('destination');
		return;
	}
	if (!initial.title.trim()) {
		showQuickPanel('content');
		document.getElementById('title')?.focus();
		status.show('Give your post a title.', 'error');
		return;
	}
	if (initial.rootAttachments.some(item => item.status === 'uploading')) {
		status.show('An attachment is still uploading.', 'working');
		return;
	}
	button.disabled = true;
	try {
		const pending = initial.rootAttachments.filter(item => item.status !== 'uploaded' && !item.publicPath);
		for (const attachment of pending) {
			if (state.snapshot().identity.aliasId !== initial.identity.aliasId) {
				throw Error('The posting alias changed. Check your attachments before continuing.');
			}
			if (!state.snapshot().rootAttachments.some(item => item.id === attachment.id)) continue;
			if (!attachment.file) throw Error('Choose the local attachment again before continuing.');
			button.textContent = 'Uploading…';
			await controller.actions.mediaActions().upload({kind: 'root'}, attachment);
			const current = state.snapshot().rootAttachments.find(item => item.id === attachment.id);
			if (current && current.status !== 'uploaded') throw Error(current.error || 'An attachment could not be uploaded.');
		}
		if (state.snapshot().identity.aliasId !== initial.identity.aliasId) throw Error('The posting alias changed. Review your attachments.');
		composer.review.open();
	} catch (error) {
		showQuickPanel('content');
		status.show(error.message, 'error');
	} finally {
		button.disabled = false;
		button.textContent = 'Next';
	}
}
