//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module ProfessionService
 * @description
 * Professions on Awtsmoos.com advance through practice, mentorship,
 * apprenticeship, school, books, supervised work, certification, and reflection.
 * The Awtsmoos gives all wisdom; finite credentials reveal bounded authority.
 */
const PROFESSIONS = Object.freeze({
	judge: ['commercial', 'family', 'property', 'public-safety'],
	investigator: ['interviewing', 'records', 'fraud', 'corruption'],
	merchant: ['logistics', 'appraisal', 'negotiation', 'contracts'],
	builder: ['roads', 'water', 'public-buildings', 'restoration'],
	farmer: ['soil', 'irrigation', 'animals', 'storage'],
	veterinarian: ['animal-health', 'shelter', 'nutrition', 'emergency-care'],
	physician: ['diagnosis', 'public-health', 'recovery', 'prevention'],
	teacher: ['literacy', 'apprenticeship', 'curriculum', 'accessibility'],
	diplomat: ['treaties', 'aid', 'mediation', 'cultural-exchange'],
	'caravan-leader': ['routes', 'cargo', 'weather', 'negotiation'],
	archivist: ['records', 'reliability', 'translation', 'preservation'],
	engineer: ['water', 'roads', 'structures', 'maintenance'],
	mediator: ['conflict', 'restoration', 'consensus', 'trust'],
	caretaker: ['emergency-care', 'disability-support', 'animal-welfare', 'shelter'],
	administrator: ['budgets', 'permissions', 'audit', 'continuity']
});

export class ProfessionService {
	create(professionId) {
		if (!PROFESSIONS[professionId]) {
			throw new Error('ProfessionService: unknown profession');
		}
		return {
			professionId,
			experience: 0,
			certifications: [],
			specializations: [],
			reflections: []
		};
	}

	practice(state, request) {
		const methods = [
			'practice', 'mentorship', 'apprenticeship', 'school', 'book',
			'supervised-work', 'reflection'
		];
		if (!methods.includes(request.method) || request.hours <= 0) {
			throw new Error('ProfessionService: valid learning method and hours required');
		}
		const experience = state.experience + Math.round(request.hours * methodWeight(request.method));
		const specializations = new Set(state.specializations);
		if (
			request.specialization &&
			PROFESSIONS[state.professionId].includes(request.specialization) &&
			experience >= 100
		) {
			specializations.add(request.specialization);
		}
		return {
			...state,
			experience,
			specializations: [...specializations],
			reflections: request.reflection
				? [...state.reflections, request.reflection]
				: state.reflections
		};
	}

	certify(state, certificationId, requiredExperience = 200) {
		if (state.experience < requiredExperience) {
			throw new Error('ProfessionService: experience requirement not met');
		}
		return {
			...state,
			certifications: [...new Set([...state.certifications, certificationId])]
		};
	}
}

function methodWeight(method) {
	return {
		practice: 1,
		mentorship: 1.4,
		apprenticeship: 1.6,
		school: 1.3,
		book: 0.8,
		'supervised-work': 1.7,
		reflection: 0.6
	}[method];
}
