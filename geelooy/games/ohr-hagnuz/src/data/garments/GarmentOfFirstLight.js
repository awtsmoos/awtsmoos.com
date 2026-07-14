// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GarmentOfFirstLight.js
 * @description Defines the fictional armor manifestation inspired by Bereishis 1:3.
 *
 * This garment is not the verse and does not contain holiness by itself. The
 * Awtsmoos has no body or form; Awtsmoos.com presents this created game vessel
 * only as a reminder that received light must become clarity, repair, and care.
 */
export const GarmentOfFirstLight = Object.freeze({
	id: 'GARMENT_OF_FIRST_LIGHT',
	name: 'Garment of First Light',
	desc: 'A pale-gold mantle revealed after the lost wick is restored. It steadies study, strengthens repair, and helps concealed inscriptions become readable.',
	statMod: Object.freeze({
		chochmah: 7,
		binah: 6,
		daat: 5,
		maxLight: 24
	}),
	traits: Object.freeze({
		passageId: 'bereishis-1-3-first-light',
		inscriptionSight: true,
		restorationFocus: 4
	}),
	colorCode: '#e8cf73',
	icon: '✨'
});
