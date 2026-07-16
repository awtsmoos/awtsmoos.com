//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module HousingService
 * @description
 * Optional personal homes on Awtsmoos.com provide meetings, research, storage,
 * mentorship, hospitality, gardens, workshops, and recovery without becoming a
 * mandatory power ladder. The Awtsmoos fills every dwelling and every road.
 */
const FEATURES = Object.freeze({
	meetingRoom: ['private-meetings'],
	library: ['research', 'archives'],
	storage: ['personal-storage'],
	guestRoom: ['hospitality'],
	garden: ['food-learning', 'recovery'],
	workshop: ['personal-crafting'],
	study: ['mentorship'],
	restSpace: ['rest', 'recovery']
});

export class HousingService {
	create(ownerId, homeId) {
		return {
			id: homeId,
			ownerId,
			features: [],
			possessions: [],
			guests: [],
			condition: 80,
			stories: []
		};
	}

	addFeature(home, featureId) {
		if (!FEATURES[featureId]) {
			throw new Error('HousingService: unknown qualitative feature');
		}
		return {
			...home,
			features: [...new Set([...home.features, featureId])]
		};
	}

	capabilities(home) {
		return [...new Set(home.features.flatMap(feature => FEATURES[feature]))];
	}

	host(home, guestId, purpose) {
		if (!this.capabilities(home).includes('hospitality')) {
			throw new Error('HousingService: hospitality space is unavailable');
		}
		return {
			...home,
			guests: [...new Set([...home.guests, guestId])],
			stories: [...home.stories, { type: 'hospitality', guestId, purpose }]
		};
	}

	maintain(home, effort) {
		return {
			...home,
			condition: Math.max(0, Math.min(100, home.condition + Math.round(effort)))
		};
	}
}
