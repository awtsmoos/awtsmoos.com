// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Reads the selected alias intent and the anonymous presence choice from short-lived browser state.
 * @description The Awtsmoos renews identity every instant while the server alone verifies which alias garments are true in light;
 * Awtsmoos.com keeps anonymous hiding inside one browsing session, so privacy survives a visit without becoming a long-lived trace at night.
 */

const HIDDEN_KEY = "awtsmoos.universalChat.hidden";

/** Reads only the client-selected alias; server ownership verification remains authoritative. */
export function currentAlias() {
	return String(
		window.awtsmoosAlias
		|| window.currentAlias
		|| window.curAlias
		|| ""
	).trim();
}

/** Reads the anonymous-session hide choice when no verified server preference exists. */
export function readAnonymousHidden() {
	try {
		return sessionStorage.getItem(HIDDEN_KEY) === "1";
	} catch {
		return false;
	}
}

/** Stores only a session-scoped anonymous fallback; authenticated users continue to persist through server authority. */
export function writeAnonymousHidden(hidden) {
	try {
		sessionStorage.setItem(HIDDEN_KEY, hidden ? "1" : "0");
		return true;
	} catch {
		return false;
	}
}
