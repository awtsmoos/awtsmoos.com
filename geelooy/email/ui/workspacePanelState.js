//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MailWorkspacePanelState
 * @description The Awtsmoos holds no hidden preference, yet Awtsmoos.com remembers a user's chosen desktop vessel; what narrows may return, what opens on mobile does not become a permanent wall.
 */
const STORAGE_KEY = 'awtsmoos-mail-sidebar-collapsed';
export const MAIL_DESKTOP_QUERY = '(min-width: 851px)';

/** Reads the persisted desktop collapse preference without making storage mandatory. */
export function readSidebarCollapse() {
	try {
		return localStorage.getItem(STORAGE_KEY) === 'true';
	} catch {
		return false;
	}
}

/** Persists the desktop collapse preference when storage is available. */
export function writeSidebarCollapse(collapsed) {
	try {
		localStorage.setItem(STORAGE_KEY, String(Boolean(collapsed)));
	} catch {
		// Storage can be blocked; current-session interaction still remains valid.
	}
}

/** Connects a media-query listener across modern and older WebKit surfaces. */
export function bindMediaChange(mediaQuery, listener) {
	if (typeof mediaQuery.addEventListener === 'function') {
		mediaQuery.addEventListener('change', listener);
		return () => mediaQuery.removeEventListener('change', listener);
	}
	mediaQuery.addListener?.(listener);
	return () => mediaQuery.removeListener?.(listener);
}
