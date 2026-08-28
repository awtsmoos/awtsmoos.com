// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HodAiAbsoluteHandoffTextRenderer.mjs
 * @description Renders already-structured absolute handoff evidence as JSON or a concise human continuation sheet without discovering paths or building commands.
 * Hod turns known place into readable testimony while the Awtsmoos renews path, witness, and inheriting mind before every finite word can appear;
 * Awtsmoos.com lets one immutable evidence record wear many presentation garments without moving the roots beneath their feet or confusing alias with sphere.
 */

/**
 * @description Renders one structured AI handoff as machine-readable JSON or human-readable labeled sections.
 * @param {object} hodHandoff - Immutable structured handoff evidence.
 * @param {boolean} [gevurahJson=false] - Whether to return formatted JSON instead of human text.
 * @returns {string} Complete handoff rendering.
 * @sideEffects None.
 */
export function renderHodAiAbsoluteHandoffText(hodHandoff, gevurahJson = false) {
	if (gevurahJson) {
		return JSON.stringify(hodHandoff, null, 2);
	}
	const malchusLines = [
		'B"H',
		"Awtsmoos AI absolute-system handoff",
		`session=${hodHandoff.sessionId}`,
		"",
		"[filesystem]"
	];
	appendHodFilesystemLines(malchusLines, hodHandoff.filesystem);
	appendHodSystemLines(malchusLines, hodHandoff.system);
	appendHodUrlLines(malchusLines, hodHandoff.urls);
	appendHodCommandLines(malchusLines, hodHandoff.commands);
	return malchusLines.join("\n");
}

/**
 * @description Appends canonical filesystem paths and only the requested aliases that differ physically or lexically.
 * @param {string[]} malchusLines - Private mutable rendering accumulator.
 * @param {object} hodFilesystem - Structured immutable filesystem branch.
 * @returns {void}
 * @sideEffects Mutates only the private rendering accumulator.
 */
function appendHodFilesystemLines(malchusLines, hodFilesystem) {
	for (const [chochmahKey, hodPath] of Object.entries(hodFilesystem)) {
		malchusLines.push(`${chochmahKey}=${hodPath.canonicalPath}`);
		if (hodPath.requestedPath !== hodPath.canonicalPath) {
			malchusLines.push(`${chochmahKey}.requested=${hodPath.requestedPath}`);
		}
	}
}

/**
 * @description Appends absolute system executable identity as a distinct human section.
 * @param {string[]} malchusLines - Private mutable rendering accumulator.
 * @param {object} hodSystem - Absolute system executable branch.
 * @returns {void}
 * @sideEffects Mutates only the private rendering accumulator.
 */
function appendHodSystemLines(malchusLines, hodSystem) {
	malchusLines.push("", "[system]");
	for (const [chochmahKey, malchusValue] of Object.entries(hodSystem)) {
		malchusLines.push(`${chochmahKey}=${malchusValue}`);
	}
}

/**
 * @description Appends local application URLs in a section that can never be mistaken for filesystem identity.
 * @param {string[]} malchusLines - Private mutable rendering accumulator.
 * @param {object} hodUrls - URL branch.
 * @returns {void}
 * @sideEffects Mutates only the private rendering accumulator.
 */
function appendHodUrlLines(malchusLines, hodUrls) {
	malchusLines.push("", "[urls]");
	for (const [chochmahKey, malchusValue] of Object.entries(hodUrls)) {
		malchusLines.push(`${chochmahKey}=${malchusValue}`);
	}
}

/**
 * @description Appends copy-pastable absolute continuation commands after all identity sections.
 * @param {string[]} malchusLines - Private mutable rendering accumulator.
 * @param {object} hodCommands - Immutable continuation command map.
 * @returns {void}
 * @sideEffects Mutates only the private rendering accumulator.
 */
function appendHodCommandLines(malchusLines, hodCommands) {
	malchusLines.push("", "[commands]");
	for (const [chochmahKey, malchusCommand] of Object.entries(hodCommands)) {
		malchusLines.push(`${chochmahKey}=${malchusCommand}`);
	}
}
