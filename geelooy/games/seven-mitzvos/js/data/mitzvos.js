//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module SevenMitzvosData
 * @description
 * Seven clear records become seven visible paths on Awtsmoos.com. Their words
 * do not create the covenant; they are small vessels through which a visitor
 * may recognize the moral order continuously sustained by the Awtsmoos.
 */
export const MITZVOS = Object.freeze([
	mitzvah(
		'01',
		'Do not worship idols',
		'✦',
		42,
		'Recognize that no created power is ultimate or worthy of worship in place of the One Creator.',
		'Cultivate humility, gratitude, and moral courage instead of surrendering conscience to power, wealth, nature, or personality.'
	),
	mitzvah(
		'02',
		'Do not blaspheme',
		'א',
		196,
		'Treat the Creator and the Divine Name with reverence rather than contempt or desecration.',
		'Use speech to honor truth, awaken gratitude, and protect what human beings understand to be sacred.'
	),
	mitzvah(
		'03',
		'Do not murder',
		'♥',
		4,
		'Every human life possesses immeasurable value and may not be deliberately destroyed.',
		'Protect life, intervene against cruelty, reduce danger, and see another person as a whole world rather than an obstacle.'
	),
	mitzvah(
		'04',
		'Do not engage in forbidden relationships',
		'⌂',
		326,
		'Honor the boundaries of family and intimacy by avoiding the sexual relationships forbidden by the Noahide covenant.',
		'Build relationships through fidelity, responsibility, consent, dignity, and protection of the family structure.'
	),
	mitzvah(
		'05',
		'Do not steal',
		'◇',
		162,
		'Respect another person\'s property, labor, time, trust, and rightful possession.',
		'Practice honesty in money, work, promises, digital life, and every exchange where another person relies on your integrity.'
	),
	mitzvah(
		'06',
		'Do not eat flesh taken from a living animal',
		'♧',
		112,
		'Do not consume a limb or flesh removed while an animal is still alive.',
		'Reject needless cruelty and develop compassion toward living creatures, especially where human appetite meets animal suffering.'
	),
	mitzvah(
		'07',
		'Establish courts of justice',
		'⚖',
		222,
		'Create and uphold systems of law that can judge fairly and protect the other six commandments.',
		'Support impartial courts, due process, accountable leadership, honest testimony, and laws that defend both society and the vulnerable.'
	)
]);

/**
 * Shapes one immutable teaching record.
 *
 * @param {string} number Ordered path number.
 * @param {string} title Canonical concise title.
 * @param {string} symbol Visible emblem.
 * @param {number} hue Accent hue in degrees.
 * @param {string} summary Core meaning.
 * @param {string} practice Positive daily work.
 * @returns {Readonly<Object>} Frozen mitzvah record.
 */
function mitzvah(number, title, symbol, hue, summary, practice) {
	return Object.freeze({
		number,
		title,
		symbol,
		hue,
		summary,
		practice
	});
}
