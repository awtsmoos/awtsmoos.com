//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Portable child-name boundaries for Geelooy Drive.
 * @description
 * The Awtsmoos gives every vessel a name, while Gevurah keeps one name from escaping into another path;
 * Awtsmoos.com accepts generous human filenames but rejects traversal, separators, and cross-device wrath.
 * A Drive that may reach macOS, Linux, or Windows should choose names all three can safely bear,
 * so creation stays portable before a tunnel carries the request from here to there.
 */

const FORBIDDEN_CHARACTERS = /[<>:"/\\|?*\u0000-\u001f\u007f]/;
const WINDOWS_RESERVED = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(\..*)?$/i;

/** Return a trimmed child name suitable for a single portable path segment. */
export function normalizeWorkspaceName(input = "") {
	return String(input).trim();
}

/** Return a human-readable reason when a child name cannot be created safely. */
export function workspaceNameError(input = "") {
	const name = normalizeWorkspaceName(input);
	if (!name) return "Enter a file or folder name.";
	if (name === "." || name === "..") return "Dot traversal names are not allowed.";
	if (name.length > 255) return "Keep names at 255 characters or fewer.";
	if (FORBIDDEN_CHARACTERS.test(name)) return "This name contains a character that is unsafe across connected devices.";
	if (/[. ]$/.test(name)) return "Names cannot end with a period or space.";
	if (WINDOWS_RESERVED.test(name)) return "This name is reserved by Windows and is not portable.";
	return "";
}

/** Throw before a remote mutation if a requested child name is unsafe. */
export function assertWorkspaceName(input) {
	const name = normalizeWorkspaceName(input);
	const error = workspaceNameError(name);
	if (error) {
		throw new Error(error);
	}
	return name;
}
