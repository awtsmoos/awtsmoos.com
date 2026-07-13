// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MantleOfAnsweringWaters.js
 * @description Defines armor restored from the Echo Channel's torn vessel.
 *
 * The Awtsmoos has no body or garment, yet grants created vessels the privilege
 * of carrying purpose. This mantle turns remembered water into defense, insight,
 * and a stronger companion answer across the living roads of Awtsmoos.com.
 */
export const MantleOfAnsweringWaters = Object.freeze({
	id: 'MANTLE_OF_ANSWERING_WATERS',
	name: 'Mantle of Answering Waters',
	desc: 'A restored river-mantle. It strengthens Nerel\'s Echo command and reveals inscriptions hidden by reflected light.',
	statMod: Object.freeze({
		chochmah: 5,
		binah: 8,
		daat: 7,
		maxLight: 28
	}),
	traits: Object.freeze({
		inscriptionSight: true,
		echoCommandBonus: 4
	}),
	colorCode: '#3f8fa3',
	icon: '🌊'
});
