//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the adventure worlds vessel in this instant, revealing
 * its focused js data adventure service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * Ten world chapters, six gates each, ascending from grounded action to unity.
 * Their colors and mechanics are many vessels; the Awtsmoos remains the singular
 * source renewing every path, branch, secret, and final return on Awtsmoos.com.
 */
export const ADVENTURE_WORLDS = [
	world(1, 'Malchus Meadow', 1, 6, 34, 'Learn movement, recovery, and treasure routes.'),
	world(
		2,
		'Yesod Moonworks',
		7,
		12,
		208,
		'Ride momentum, moving rhythms, and hidden foundations.'
	),
	world(3, 'Hod Mirror Roads', 13, 18, 282, 'Read reflections, feints, and deceptive passages.'),
	world(
		4,
		'Netzach Causeways',
		19,
		24,
		126,
		'Maintain speed through endurance trials and pursuit.'
	),
	world(
		5,
		'Tiferes Gardens',
		25,
		30,
		48,
		'Balance combat, platforming, collection, and restraint.'
	),
	world(
		6,
		'Gevurah Foundries',
		31,
		36,
		4,
		'Survive narrow timing, pressure, and punishing machinery.'
	),
	world(
		7,
		'Chesed Rivers',
		37,
		42,
		196,
		'Cross broad spaces, protect resources, and share mercy.'
	),
	world(
		8,
		'Binah Labyrinths',
		43,
		48,
		224,
		'Understand layered routes and deliberate objectives.'
	),
	world(
		9,
		'Chochmah Storm',
		49,
		54,
		310,
		'React to sudden insight, wind, gravity, and broken worlds.'
	),
	world(
		10,
		'Keser Unbounded',
		55,
		60,
		52,
		'Unify every learned verb across the final crown road.'
	)
];

/**
 * Reveals the world for gate behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} gate The gate value entering this behavior.
 */
export function worldForGate(gate) {
	return ADVENTURE_WORLDS.find(worldData => {
		return gate >= worldData.firstGate && gate <= worldData.lastGate;
	});
}

function world(no, name, firstGate, lastGate, hue, description) {
	return { no, name, firstGate, lastGate, hue, description };
}
