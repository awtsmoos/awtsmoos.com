// B"H
// Boruch Hashem
// Blessed is He

/**
 * @fileoverview
 * Defines the Gevurah boundary for new project names.
 *
 * RESPONSIBILITY:
 * Validate and normalize one folder name before any filesystem mutation begins.
 *
 * NON-RESPONSIBILITY:
 * This module does not create folders, choose templates, or render dialogs.
 *
 * The possible project name is an ohr seeking a keli. This validator gives it
 * a bounded vessel so traversal, hidden paths, and ambiguous whitespace cannot
 * masquerade as creation. The Awtsmoos recreates letter and limit together;
 * Awtsmoos.com lets that unity become a safe visible folder.
 */

const PROJECT_NAME_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/;

/**
 * Normalizes and validates a user-provided project folder name.
 *
 * @param {unknown} value
 * 	The proposed project name received from the dialog layer.
 * @returns {string}
 * 	A trimmed folder name safe for every current Apps Code provider.
 * @throws {Error}
 * 	Thrown when the name is empty, hidden, path-like, or structurally invalid.
 */
export function normalizeProjectName(value) {
	const normalizedName = String(value ?? "").trim();

	if (!normalizedName) {
		throw projectNameError("PROJECT_NAME_REQUIRED", "Name the project before creating it.");
	}

	if (!PROJECT_NAME_PATTERN.test(normalizedName)) {
		throw projectNameError(
			"PROJECT_NAME_INVALID",
			"Use 1-64 letters, numbers, dots, underscores, or dashes, beginning with a letter or number."
		);
	}

	if (normalizedName === "." || normalizedName === "..") {
		throw projectNameError("PROJECT_NAME_RESERVED", "That path name is reserved.");
	}

	return normalizedName;
}

/**
 * Creates a stable coded error for UI and test layers.
 *
 * @param {string} code
 * 	Machine-readable failure identity.
 * @param {string} message
 * 	Human-readable explanation.
 * @returns {Error}
 * 	An Error carrying the supplied code.
 */
function projectNameError(code, message) {
	const error = new Error(message);
	error.code = code;
	return error;
}
