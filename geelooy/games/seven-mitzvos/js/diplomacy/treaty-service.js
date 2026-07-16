//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module TreatyService
 * @description
 * Borders on Awtsmoos.com become places for obligation rather than conquest. The Awtsmoos contains all lands, while treaties bind named parties for bounded time.
 */
export class TreatyService {
	/**
	 * @param {object} request Treaty request.
	 * @param {string} treatyId Stable identity.
	 * @param {number} currentDay Current world day.
	 * @returns {object} Active treaty.
	 */
	create(request, treatyId, currentDay) {
		if (!Array.isArray(request.parties) || request.parties.length < 2) {
			throw new Error('TreatyService: at least two parties are required');
		}
		if (!Array.isArray(request.obligations) || !request.obligations.length) {
			throw new Error('TreatyService: obligations are required');
		}
		const durationDays = Math.max(1, Math.min(360, request.durationDays || 30));
		return {
			id: treatyId,
			parties: [...new Set(request.parties)],
			obligations: request.obligations.map(item => ({ ...item })),
			createdDay: currentDay,
			expiresDay: currentDay + durationDays,
			status: 'active',
			trust: 50
		};
	}

	/**
	 * @param {object} treaty Treaty record.
	 * @param {number} currentDay Current day.
	 * @returns {object} Expired or unchanged treaty.
	 */
	refresh(treaty, currentDay) {
		if (treaty.status === 'active' && currentDay >= treaty.expiresDay) {
			return { ...treaty, status: 'expired' };
		}
		return treaty;
	}
}
