//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module KnowledgeService
 * @description
 * Knowledge on Awtsmoos.com retains discoverer, source, reliability, region,
 * access, language, teaching requirements, diffusion, and obsolescence. The
 * Awtsmoos is infinite knowledge; finite records must disclose provenance.
 */
export class KnowledgeService {
	create(request, knowledgeId) {
		if (!request.title || !request.discovererId || !request.sourceId) {
			throw new Error('KnowledgeService: title, discoverer, and source required');
		}
		return {
			id: knowledgeId,
			title: request.title,
			discovererId: request.discovererId,
			sourceId: request.sourceId,
			reliability: clamp(request.reliability ?? 60),
			regionId: request.regionId || null,
			access: request.access || 'public',
			language: request.language || 'en',
			teachingRequirements: [...(request.teachingRequirements || [])],
			diffusionRate: Math.max(0, Math.min(1, request.diffusionRate ?? 0.1)),
			obsolescenceRate: Math.max(0, Math.min(1, request.obsolescenceRate ?? 0.01)),
			holders: [request.discovererId],
			translations: {}
		};
	}

	teach(knowledge, teacherId, learnerId, credentials = []) {
		if (!knowledge.holders.includes(teacherId)) {
			throw new Error('KnowledgeService: teacher does not hold knowledge');
		}
		const qualified = knowledge.teachingRequirements.every(requirement => {
			return credentials.includes(requirement);
		});
		if (!qualified) {
			throw new Error('KnowledgeService: teaching requirements not met');
		}
		return {
			...knowledge,
			holders: [...new Set([...knowledge.holders, learnerId])]
		};
	}

	translate(knowledge, locale, translatorId, title) {
		return {
			...knowledge,
			translations: {
				...knowledge.translations,
				[locale]: { translatorId, title }
			}
		};
	}

	age(knowledge, years) {
		return {
			...knowledge,
			reliability: clamp(
				knowledge.reliability *
					Math.pow(1 - knowledge.obsolescenceRate, years)
			)
		};
	}
}

function clamp(value) {
	return Math.max(0, Math.min(100, Math.round(value)));
}
