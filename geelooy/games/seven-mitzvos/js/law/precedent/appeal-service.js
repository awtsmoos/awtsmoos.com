//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module AppealService
 * @description
 * Appeals on Awtsmoos.com require named grounds, a higher jurisdiction, and a
 * reviewable result. The Awtsmoos needs no correction; finite courts preserve
 * humility through explicit review and restitution when error is found.
 */
export class AppealService {
	file(courtCase, request, appealId) {
		if (courtCase.status !== 'resolved') {
			throw new Error('AppealService: unresolved cases cannot be appealed');
		}
		const allowed = ['new-evidence', 'procedural-error', 'misapplied-law'];
		if (!allowed.includes(request.ground) || !request.higherJurisdiction) {
			throw new Error('AppealService: valid ground and jurisdiction required');
		}
		return {
			id: appealId,
			caseId: courtCase.id,
			ground: request.ground,
			higherJurisdiction: request.higherJurisdiction,
			status: 'filed',
			result: null
		};
	}

	review(appeal, decision) {
		const allowed = ['affirmed', 'modified', 'reversed', 'remanded'];
		if (!allowed.includes(decision.result) || !decision.reason) {
			throw new Error('AppealService: valid result and reason required');
		}
		return {
			...appeal,
			status: 'resolved',
			result: {
				result: decision.result,
				reason: decision.reason,
				revisedRemedy: decision.revisedRemedy || null
			}
		};
	}
}
