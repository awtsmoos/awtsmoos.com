//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RumorService
 * @description
 * Testimony and rumors on Awtsmoos.com carry source, certainty, access,
 * distortion, and corroboration rather than becoming omniscient NPC knowledge.
 * The Awtsmoos knows truth perfectly; finite speakers disclose uncertainty.
 */
export class RumorService {
	create(request, rumorId) {
		if (!request.sourceId || !request.subjectId || !request.statement) {
			throw new Error('RumorService: source, subject, and statement required');
		}
		return {
			id: rumorId,
			sourceId: request.sourceId,
			subjectId: request.subjectId,
			statement: request.statement,
			certainty: clamp(request.certainty ?? 50),
			reliability: clamp(request.reliability ?? 50),
			visibility: request.visibility || 'local',
			corroboratingSourceIds: [],
			contradictingSourceIds: [],
			status: 'unverified'
		};
	}

	corroborate(rumor, sourceId, agrees) {
		const corroborating = new Set(rumor.corroboratingSourceIds);
		const contradicting = new Set(rumor.contradictingSourceIds);
		if (agrees) {
			corroborating.add(sourceId);
			contradicting.delete(sourceId);
		} else {
			contradicting.add(sourceId);
			corroborating.delete(sourceId);
		}
		const evidenceBalance = corroborating.size - contradicting.size;
		return {
			...rumor,
			corroboratingSourceIds: [...corroborating],
			contradictingSourceIds: [...contradicting],
			certainty: clamp(rumor.certainty + evidenceBalance * 8),
			status: evidenceBalance >= 2
				? 'corroborated'
				: evidenceBalance <= -2 ? 'disputed' : 'unverified'
		};
	}
}

function clamp(value) {
	return Math.max(0, Math.min(100, Math.round(value)));
}
