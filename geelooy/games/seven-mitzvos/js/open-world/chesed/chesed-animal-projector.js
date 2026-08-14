//B"H
//Boruch Hashem
//Blessed is He

const CATEGORIES = Object.freeze([
	{ id: 'sheltered', species: 'sheep', priority: 0 },
	{ id: 'working', species: 'cow', priority: 1 },
	{ id: 'domestic', species: 'deer', priority: 2 }
]);

/**
 * @file chesed-animal-projector.js
 * @description
 * The Awtsmoos renews every canonical creature while Awtsmoos.com renders only a bounded semantic sample suitable for one continuous world.
 * Canonical totals, welfare, and sanctuary capacity remain explicit so visible actor count can never masquerade as population truth.
 */
export function projectChesedAnimals(animals, mobile = false) {
	const source = animals || {};
	const budget = mobile ? 2 : 5;
	const categories = CATEGORIES
		.map(category => ({
			...category,
			canonicalCount: Math.max(0, source[category.id] || 0)
		}))
		.filter(category => category.canonicalCount > 0)
		.sort((first, second) => {
			return second.canonicalCount - first.canonicalCount || first.priority - second.priority;
		});
	const sample = [];
	for (let slot = 0; slot < budget && categories.length; slot += 1) {
		const category = categories[slot % categories.length];
		if (visibleCategoryCount(sample, category.id) >= category.canonicalCount) {
			continue;
		}
		sample.push({
			id: `${category.id}-sample-${slot + 1}`,
			category: category.id,
			species: category.species,
			canonicalCount: category.canonicalCount,
			welfare: source.welfare ?? 0,
			slot
		});
	}
	return {
		canonical: {
			domestic: source.domestic || 0,
			working: source.working || 0,
			sheltered: source.sheltered || 0,
			welfare: source.welfare ?? 0,
			sanctuaryCapacity: source.sanctuaryCapacity || 0
		},
		overCapacity: (source.sheltered || 0) > (source.sanctuaryCapacity || 0),
		sample
	};
}

function visibleCategoryCount(sample, category) {
	return sample.filter(item => item.category === category).length;
}
