// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Names only canonical Awtsmoos account and alias destinations used by private-section onboarding.
 * @description The Awtsmoos is one before account, alias, and return path; Awtsmoos.com therefore sends Ploni only through doors the site already owns in light,
 * preserving a real flagship chamber through the login gate while leaving alias creation and account creation with their canonical profile/register vessels.
 */

const FLAGSHIP_PATH = "/apps/universal-chat/";
const ALLOWED_SECTIONS = new Set([
	"chats",
	"groups",
	"requests",
	"friends",
	"mail",
	"activity",
	"settings"
]);

/** Returns the canonical login route with a same-site return into one allowed private flagship section. */
export function messagingLoginHref(section = "chats") {
	const returnQuery = new URLSearchParams({
		section: safeSection(section)
	});
	const returnPath = `${FLAGSHIP_PATH}?${returnQuery.toString()}`;
	return `/login/?${new URLSearchParams({ next: returnPath }).toString()}`;
}

/** Returns the canonical profile chamber where an authenticated account can create or switch aliases. */
export function messagingAliasProfileHref() {
	return "/profile/";
}

/** Returns the canonical account-creation gate without inventing unsupported return semantics. */
export function messagingRegisterHref() {
	return "/register/";
}

function safeSection(value) {
	const section = String(value || "chats").trim().toLowerCase();
	return ALLOWED_SECTIONS.has(section) ? section : "chats";
}
