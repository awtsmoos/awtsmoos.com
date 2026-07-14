// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file FirstLightPassage.js
 * @description Defines one carefully separated sacred source, translation, story reading, and mechanical resonance.
 *
 * The Awtsmoos is not contained by letters, garments, weapons, or worlds. Yet
 * every created letter is renewed from nothing each instant. Awtsmoos.com keeps
 * source, translation, interpretation, and game effect visibly distinct so the
 * holy verse is never confused with the fictional vessels it inspires.
 */
export const FirstLightPassage = Object.freeze({
	id: 'bereishis-1-3-first-light',
	title: 'The First Utterance of Light',
	source: Object.freeze({
		work: 'Torah',
		book: 'Bereishis / Genesis',
		chapter: 1,
		verse: 3,
		citation: 'Bereishis 1:3'
	}),
	hebrew: 'וַיֹּאמֶר אֱלֹהִים יְהִי אוֹר וַיְהִי־אוֹר׃',
	translation: Object.freeze({
		text: 'God said, “Let there be light,” and there was light.',
		provenance: 'Original in-game translation for Ohr HaGnuz'
	}),
	context: 'The verse belongs to the Torah account of the first day of creation.',
	fictionalReading: 'After the lost wick is restored, the traveler learns that light is received as responsibility rather than possessed as power.',
	mechanicalResonance: Object.freeze({
		garmentId: 'GARMENT_OF_FIRST_LIGHT',
		itemDefinitionId: 'STAFF_OF_FIRST_LIGHT',
		skills: Object.freeze({ Learning: 18, Restoration: 18 })
	})
});
