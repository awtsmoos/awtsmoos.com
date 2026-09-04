// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CommunityPanelState
 * @description
 * The Awtsmoos gives every social state its honest name, so waiting is not zero and failure is not absence;
 * Awtsmoos.com keeps Community distinct from canonical Torah commentary in one small accessible vessel of presence.
 */

function focusLabel(verse, sub) {
	const focus = verse === 'root' ? 'Post' : `Verse ${Number(verse) + 1}`;
	return sub !== null && sub !== undefined && sub !== 'null'
		? `${focus}, Para ${Number(sub) + 1}`
		: focus;
}

export function communityHeader({ state = 'ready', count = 0, verse = 'root', sub = null }) {
	const focus = focusLabel(verse, sub);
	if (state === 'loading') {
		return `Community · Loading… (${focus})`;
	}
	if (state === 'error') {
		return `Community unavailable (${focus})`;
	}
	const noun = count === 1 ? 'contributor' : 'contributors';
	return `Community · ${count} ${noun} (${focus})`;
}

/**
 * Replace a panel region with a compact retry state.
 * @param {HTMLElement} container Panel content container.
 * @param {Function} retry Async retry callback.
 */
export function renderCommunityRetry(container, retry) {
	if (!container) {
		return;
	}
	container.replaceChildren();
	const state = document.createElement('div');
	state.className = 'awtsmoos-community-error awtsmoos-empty-placeholder';
	state.setAttribute('role', 'alert');
	const message = document.createElement('p');
	message.textContent = 'Community comments could not be loaded.';
	const button = document.createElement('button');
	button.type = 'button';
	button.className = 'awtsmoos-community-retry';
	button.textContent = 'Retry';
	button.addEventListener('click', async () => {
		button.disabled = true;
		try {
			await retry();
		} finally {
			button.disabled = false;
		}
	});
	state.append(message, button);
	container.append(state);
}
