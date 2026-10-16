//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file Canonical zero-network discovery for the Ikar Torah library root.
 * @description The Awtsmoos lets permanent Torah doors exist before databases wake.
 */
const IKAR_ROOT_SERIES = Object.freeze([
	{
		id: 'theWrittenTorah',
		title: 'תורה שבכתב · The Written Torah',
		description: 'The Entire Torah that Moishe and prophets got from the Creator.'
	},
	{
		id: 'theOralTorah',
		title: 'תורה שבעל פה · The Oral Torah',
		description: 'The Oral Torah.'
	},
	{
		id: 'chassidus',
		title: 'חסידות · Chassidus',
		description: 'תורת החסידות, שיחות ומאמרים · Chassidus, sichos, and maamarim.'
	},
	{
		id: 'halacha',
		title: 'הלכה · Halacha',
		description: 'הלכה למעשה · Practical Halacha.'
	},
	{
		id: 'midrash',
		title: 'מדרש · Midrash',
		description: 'מדרשי אגדה והלכה · Aggadic and Halachic Midrash.'
	},
	{
		id: 'kabbalah',
		title: 'קבלה · Kabbalah',
		description: 'תורת הקבלה · The Kabbalah.'
	},
	{
		id: 'mussar',
		title: 'מוסר · Mussar',
		description: 'ספרי מוסר · Mussar works.'
	},
	{
		id: 'torah-language-tools',
		title: 'תרגומים ומילון · Translations & Dictionary',
		description: 'תרגומים, מילונים וכלים · Translations, dictionaries, and tools.'
	},
	{
		id: 'daily-chitas',
		title: 'חת״ת יומי · Daily Chitas',
		description: 'חת״ת יומי · Daily Chitas.'
	}
]);

function getIkarRootDiscovery() {
	return {
		links: IKAR_ROOT_SERIES.map(series => ({
			kind: 'series',
			title: series.title,
			description: series.description,
			path: `/heichelos/ikar/series/${series.id}`
		}))
	};
}

module.exports = {
	IKAR_ROOT_SERIES,
	getIkarRootDiscovery
};
