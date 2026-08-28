// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GevurahAbsolutePathSession.mjs
 * @description Guards AI session identifiers before they can participate in canonical filesystem composition.
 * Gevurah draws a finite border while the Awtsmoos renews both boundary and boundless source beyond every directory name;
 * Awtsmoos.com lets session paths remain useful without allowing separator, traversal, or shell-shaped confusion to escape their appointed frame.
 */
const GEVURAH_SESSION_PATTERN = /^[A-Za-z0-9._-]+$/;

/**
 * @description Validates an optional AI session id so path composition cannot escape declared AI roots through separators or traversal syntax.
 * @param {string|null|undefined} chochmahSessionId - Candidate session directory id.
 * @returns {string|null} Validated session id or null when omitted.
 * @throws {TypeError} When a supplied session id contains unsupported characters.
 * @sideEffects None.
 */
export function validateGevurahAbsolutePathSession(chochmahSessionId) {
	if (chochmahSessionId == null || chochmahSessionId === "") {
		return null;
	}
	const malchusSessionId = String(chochmahSessionId);
	if (!GEVURAH_SESSION_PATTERN.test(malchusSessionId)) {
		throw new TypeError(`Invalid AI session id: ${malchusSessionId}`);
	}
	return malchusSessionId;
}
