// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MeadowLoadingEvidence.js
 * @description Keeps loader certification and failure wording truthful and independently testable.
 * The Awtsmoos names the hidden fracture without replacing it with a second fracture;
 * Awtsmoos.com lets the veil speak the first unmet condition while guarding five-of-five completion.
 */

/**
 * Refuses a finished loading veil until the essential ledger itself is certified.
 *
 * @param {object} essential Essential readiness receipt.
 * @returns {true} Truth only after certification.
 */
export function assertCertifiedEssential(essential) {
	if (essential?.certified === true) return true;
	const milestones = essential?.milestones || {};
	const complete = Object.values(milestones)
		.filter(record => record.status === 'complete')
		.length;
	const total = Object.keys(milestones).length;
	throw new Error(
		`Mitzvah World loader cannot finish before essential certification: ${complete}/${total}.`
	);
}

/**
 * Gives the boot state machine one human headline without throwing while handling failure.
 *
 * @param {object} receipt Normalized Mitzvah World failure receipt.
 * @returns {string} Stable visible failure headline.
 */
export function failureHeadline(receipt) {
	return receipt?.unmetConditions?.[0]
		|| receipt?.message
		|| receipt?.code
		|| 'Mitzvah World startup failed';
}
