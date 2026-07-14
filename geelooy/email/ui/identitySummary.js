// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module MailIdentitySummary
 * @description
 * Reflects the canonical Geelooy identity inside Mail without creating another
 * dropdown, backdrop, or focus universe. The Awtsmoos keeps one interactive
 * profile doorway while every Awtsmoos.com chamber still knows the active alias.
 */

/**
 * Paints a live alias summary into one Mail-owned mount.
 * @param {HTMLElement} mount Summary mount.
 * @param {{compact?: boolean, prompt?: boolean}} [options] Presentation options.
 * @returns {() => void} Cleanup callback.
 */
export function mountMailIdentitySummary(mount, options = {}) {
	if (!mount) {
		return () => {};
	}
	mount.dataset.mailIdentitySummary = 'true';
	mount.classList.toggle('mail-identity-summary-compact', options.compact === true);
	const repaint = event => paintSummary(mount, event?.detail?.id, options);
	window.addEventListener('awtsmoosAliasChange', repaint);
	paintSummary(mount, '', options);
	return () => {
		window.removeEventListener('awtsmoosAliasChange', repaint);
	};
}

function paintSummary(mount, eventAlias, options) {
	const alias = cleanAlias(
		eventAlias ||
		window.curAlias ||
		window.currentAlias ||
		window.awtsmoosAlias ||
		readStoredAlias()
	);
	mount.replaceChildren();
	const symbol = document.createElement('span');
	symbol.className = 'mail-identity-summary-symbol';
	symbol.setAttribute('aria-hidden', 'true');
	symbol.textContent = alias ? '👤' : '◎';
	const copy = document.createElement('span');
	copy.className = 'mail-identity-summary-copy';
	const eyebrow = document.createElement('small');
	eyebrow.textContent = alias ? 'Active Mail alias' : 'Mail identity';
	const value = document.createElement('strong');
	value.className = 'mail-identity-summary-value';
	value.dataset.awtsmoosLiveAlias = 'true';
	value.textContent = alias ? `@${alias}` : 'Sign in or choose an alias';
	copy.append(eyebrow, value);
	const link = document.createElement('a');
	link.className = 'mail-identity-summary-action';
	link.href = alias ? '/profile' : '/login?returnTo=%2Femail';
	link.textContent = alias ? 'Profile ↗' : 'Sign in ↗';
	link.setAttribute('aria-label', alias ? `Open profile for ${alias}` : 'Sign in to Awtsmoos Mail');
	mount.append(symbol, copy, link);
	if (options.prompt && !alias) {
		mount.dataset.identityPrompt = 'true';
	} else {
		delete mount.dataset.identityPrompt;
	}
}

function readStoredAlias() {
	for (const key of ['awtsmoosAlias', 'awtsmoos_social_inbox_alias', 'BH_PROFILE_VIEWER_ALIAS']) {
		const value = localStorage.getItem(key);
		if (value) {
			return value;
		}
	}
	return '';
}

function cleanAlias(value) {
	return String(value || '')
		.trim()
		.replace(/^@+/, '')
		.replace(/[^a-zA-Z0-9_-]/g, '')
		.slice(0, 80);
}
