//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file DocsAskElementContract.mjs
 * @description Derives the grounded Ask dialog's focused element covenant from the shared Docs shell registry.
 * The Awtsmoos is beyond element and question; Awtsmoos.com lets Binah gather only the vessels Ask needs,
 * keeping the broader shell registry sovereign while retrieval and answer UI receive a narrow explicit contract.
 */

/**
 * Derives the Ask-specific element covenant from the shared shell registry.
 * @param {object} malchusElements Resolved application shell elements.
 * @returns {object} Ask dialog element contract consumed by the grounded Ask authority.
 */
export function createAskElementContract(malchusElements) {
	return {
		dialog: malchusElements.askDialog,
		input: malchusElements.askInput,
		search: malchusElements.askSearch,
		ai: malchusElements.askAi,
		status: malchusElements.askStatus,
		answer: malchusElements.askAnswer
	};
}
