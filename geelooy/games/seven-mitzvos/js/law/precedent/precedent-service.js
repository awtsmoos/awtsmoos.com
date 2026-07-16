//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module PrecedentService
 * @description
 * Resolved cases on Awtsmoos.com become cited principles with jurisdiction,
 * facts, remedies, and authority weight. The Awtsmoos knows perfect justice;
 * finite courts preserve transparent reasoning and bounded analogy.
 */
export class PrecedentService {
	/**
	 * @param {object} courtCase Resolved case.
	 * @param {string} jurisdiction Jurisdiction identity.
	 * @returns {object} Precedent record.
	 */
	create(courtCase, jurisdiction) {
		if (courtCase.status !== 'resolved' || !courtCase.ruling) {
			throw new Error('PrecedentService: only resolved cases create precedent');
		}
		return {
			id: `precedent-${courtCase.id}`,
			caseId: courtCase.id,
			jurisdiction,
			claimTerms: tokenize(courtCase.claim),
			principle: courtCase.ruling.finding,
			remedy: courtCase.ruling.remedy,
			evidenceIds: [...courtCase.ruling.evidenceIds],
			authority: 60,
			citations: 0
		};
	}

	/**
	 * @param {object} openCase New case.
	 * @param {object[]} precedents Existing precedents.
	 * @param {string} jurisdiction Current jurisdiction.
	 * @returns {object[]} Ranked relevant precedents.
	 */
	find(openCase, precedents, jurisdiction) {
		const terms = new Set(tokenize(openCase.claim));
		return precedents.map(precedent => {
			const overlap = precedent.claimTerms.filter(term => terms.has(term)).length;
			const jurisdictionWeight = precedent.jurisdiction === jurisdiction ? 20 : 5;
			return {
				...precedent,
				relevance: overlap * 10 + jurisdictionWeight + precedent.authority
			};
		}).filter(item => item.relevance > 65)
			.sort((first, second) => second.relevance - first.relevance);
	}
}

function tokenize(value) {
	return [...new Set(String(value).toLowerCase().match(/[a-z]{3,}/g) || [])];
}
