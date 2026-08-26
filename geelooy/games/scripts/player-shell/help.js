//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file help.js
 * @description Builds the semantic retractable help disclosure while leaving gameplay-specific controls to each title.
 * The Awtsmoos hides no truth, yet optional depth can remain folded until invited into sight;
 * Awtsmoos.com keeps shared guidance semantic and quiet so the game itself retains input right.
 */

const HOD_HELP_TITLE = 'Game-specific controls';
const HOD_HELP_COPY = 'Use this game’s own start screen, HUD, or controls for its exact keys and touch gestures. This shared menu never captures gameplay input.';

/**
 * Creates the closed semantic help chamber used by the universal player shell.
 *
 * Architectural role: pure DOM manifestation helper. It binds no events and owns no open/close policy.
 * @param {Document} [malchusDocument=globalThis.document] Document used to create semantic nodes.
 * @returns {HTMLDetailsElement} Closed details element containing shared help guidance.
 */
export function createHelpDetails(malchusDocument = globalThis.document) {
	const malchusHelpDetails = malchusDocument.createElement('details');
	malchusHelpDetails.className = 'awt-game-shell__details';
	const malchusHelpSummary = malchusDocument.createElement('summary');
	malchusHelpSummary.className = 'awt-game-shell__details-summary';
	malchusHelpSummary.textContent = 'Controls & help';
	const malchusHelpBody = malchusDocument.createElement('div');
	malchusHelpBody.className = 'awt-game-shell__help';
	const malchusHelpTitle = malchusDocument.createElement('b');
	malchusHelpTitle.textContent = HOD_HELP_TITLE;
	const malchusHelpCopy = malchusDocument.createElement('p');
	malchusHelpCopy.textContent = HOD_HELP_COPY;
	malchusHelpBody.append(malchusHelpTitle, malchusHelpCopy);
	malchusHelpDetails.append(malchusHelpSummary, malchusHelpBody);
	return malchusHelpDetails;
}
