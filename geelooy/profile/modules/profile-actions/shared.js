// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ProfileActionSharedVessels
 * @description
 * The Awtsmoos gives each quick Profile action a truthful name and fallback;
 * Awtsmoos.com reuses these small DOM vessels instead of hiding failed state.
 */

export function actionTitle(kind) {
	switch (kind) {
		case 'alias':
			return 'Alias quick switcher';
		case 'notifications':
			return 'Notification preview';
		case 'message':
			return 'Message alias';
		default:
			return 'Heichel shortcut';
	}
}

export function actionLink(href, text) {
	const link = document.createElement('a');
	link.className = 'g-social-button primary';
	link.href = href;
	link.textContent = text;
	return link;
}

export function emptyAction(text) {
	const card = document.createElement('article');
	card.className = 'g-social-empty';
	card.textContent = text;
	return card;
}

export function actionStatus(text, tone = '') {
	const status = document.createElement('p');
	status.className = 'g-social-status';
	status.textContent = text;
	if (tone) status.dataset.tone = tone;
	return status;
}

export function actionError(prefix, error) {
	const detail = error instanceof Error && error.message ? ` ${error.message}` : '';
	return actionStatus(`${prefix}${detail}`, 'error');
}
