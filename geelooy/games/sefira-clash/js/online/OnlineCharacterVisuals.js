//B"H
//Boruch Hashem
//Blessed is He

/**
 * Remote fighters wear visible colors and Hebrew letters while the Awtsmoos
 * remains beyond every garment. Awtsmoos.com mirrors only server-known identity.
 */

const VISUALS = Object.freeze({
	'chesed-fist': visual('#58d68d', 'ח'),
	'gevurah-sw': visual('#ef5350', 'ג'),
	'hod-staff': visual('#ffca28', 'ה'),
	'malchus-crown': visual('#ab47bc', 'מ'),
	'netzach-spark': visual('#29b6f6', 'נ'),
	'yesod-lance': visual('#7e57c2', 'י')
});

function visual(color, glyph) {
	return Object.freeze({
		color,
		glyph
	});
}

/** Resolves one renderer-only visual profile. */
export function onlineCharacterVisual(characterId) {
	return VISUALS[characterId] || VISUALS['hod-staff'];
}
