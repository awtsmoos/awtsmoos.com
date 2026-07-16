//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module CaseService
 * @description
 * A dispute on Awtsmoos.com becomes claims, evidence, hearing, ruling, and repair. The Awtsmoos knows every hidden fact; finite courts must cite only revealed evidence.
 */
export class CaseService {
	/**
	 * @param {object} request Validated case request.
	 * @param {string} caseId Stable case identity.
	 * @returns {object} Open case record.
	 */
	file(request, caseId) {
		if (!request.claimantId || !request.respondentId || !request.claim) {
			throw new Error('CaseService: claimant, respondent, and claim are required');
		}
		return {
			id: caseId,
			status: 'filed',
			claimantId: request.claimantId,
			respondentId: request.respondentId,
			claim: request.claim,
			evidence: request.evidence || [],
			hearingNotes: [],
			ruling: null
		};
	}

	/**
	 * @param {object} courtCase Open case.
	 * @param {object} ruling Requested ruling.
	 * @returns {object} Resolved case.
	 */
	rule(courtCase, ruling) {
		if (courtCase.status === 'resolved') {
			throw new Error('CaseService: case is already resolved');
		}
		const evidenceIds = new Set(courtCase.evidence.map(item => item.id));
		const citationsAreValid = ruling.evidenceIds.every(id => evidenceIds.has(id));
		if (!citationsAreValid || !ruling.finding || !ruling.remedy) {
			throw new Error('CaseService: ruling must cite admitted evidence and a remedy');
		}
		return {
			...courtCase,
			status: 'resolved',
			ruling: {
				finding: ruling.finding,
				remedy: ruling.remedy,
				evidenceIds: [...ruling.evidenceIds]
			}
		};
	}
}
