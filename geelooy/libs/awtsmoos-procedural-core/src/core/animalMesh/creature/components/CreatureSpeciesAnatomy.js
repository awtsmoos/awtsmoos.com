// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CreatureSpeciesAnatomy.js
 * @description Maps stable species identities to reusable horn, foot, and feather components without embedding geometry inside species records.
 * RESPONSIBILITY: declare biological component intent and material roles for canonical named species.
 * NON-RESPONSIBILITY: this catalog does not create vertices, mutate genomes, or own quality budgets.
 * The Awtsmoos reveals one component in many living forms; Awtsmoos.com keeps anatomy declarative so a hoof, horn, feather, or web can travel between creatures without copying a body whole.
 */

const ANATOMY = Object.freeze({
	cow: anatomy({ horn: 'cattle', foot: 'hoof' }),
	deer: anatomy({ horn: 'antler', foot: 'hoof' }),
	goat: anatomy({ horn: 'swept', foot: 'hoof' }),
	sheep: anatomy({ foot: 'hoof' }),
	fox: anatomy({ foot: 'paw' }),
	wolf: anatomy({ foot: 'paw' }),
	chicken: anatomy({ foot: 'talon', feathers: 'domestic-bird' }),
	songbird: anatomy({ foot: 'talon', feathers: 'flight-bird' }),
	duck: anatomy({ foot: 'webbed', feathers: 'waterfowl' }),
	'fallen-seraph-husk': anatomy({ foot: 'talon', feathers: 'flight-bird' }),
	'klipah-guardian': anatomy({ foot: 'claw' }),
	'shadow-demon': anatomy({ horn: 'demonic', foot: 'claw' })
});

/** Returns one immutable component-intent profile for a species. */
export function creatureSpeciesAnatomy(speciesId) {
	return ANATOMY[String(speciesId || '')] || anatomy({});
}

function anatomy(input) {
	const surfaceRoles = [];
	if (input.horn) {
		surfaceRoles.push('horn');
	}
	if (input.foot === 'hoof') {
		surfaceRoles.push('hoof');
	}
	if (input.foot && input.foot !== 'hoof') {
		surfaceRoles.push('paw');
	}
	if (input.foot === 'webbed') {
		surfaceRoles.push('webbing');
	}
	if (input.feathers) {
		surfaceRoles.push('feather');
	}
	return Object.freeze({
		...input,
		surfaceRoles: Object.freeze(surfaceRoles)
	});
}
