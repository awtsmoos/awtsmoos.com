//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every moment while Torah gives the moments names;
 * Awtsmoos.com keeps label, method, and meaning in separate lucid frames.
 */

export const ZMAN_GROUPS = Object.freeze([
	{ id: "morning", label: "Morning" },
	{ id: "day", label: "Day & tefillah" },
	{ id: "afternoon", label: "Afternoon" },
	{ id: "evening", label: "Evening & night" }
]);

export const ZMAN_DEFINITIONS = Object.freeze([
	{
		id: "alos", group: "morning", label: "Alos HaShachar",
		note: "Dawn at 16.9° solar depression in the Chabad method."
	},
	{
		id: "alos72", group: "morning", label: "Alos — 72 minutes",
		note: "Fixed 72 minutes before standard sunrise, shown as an alternate convention."
	},
	{
		id: "misheyakir", group: "morning", label: "Misheyakir",
		note: "Earliest tallis and tefillin benchmark at 10.2° solar depression."
	},
	{
		id: "sunrise", group: "morning", label: "Hanetz / Sunrise",
		note: "Standard visible sunrise using the conventional 0.833° center correction."
	},
	{
		id: "sofShema", group: "day", label: "Latest Shema",
		note: "Three seasonal hours after the selected opinion's day begins."
	},
	{
		id: "sofTefillah", group: "day", label: "Latest Shacharis",
		note: "Four seasonal hours after the selected opinion's day begins."
	},
	{
		id: "sofAchilasChametz", group: "day", label: "Latest eating chametz",
		note: "Four seasonal hours after the day begins; relevant on Erev Pesach."
	},
	{
		id: "sofBiur", group: "day", label: "Latest biur chametz",
		note: "Five seasonal hours after the selected opinion's day begins."
	},
	{
		id: "chatzos", group: "day", label: "Chatzos",
		note: "Six seasonal hours after the selected opinion's day begins."
	},
	{
		id: "minchaGedola", group: "afternoon", label: "Mincha Gedolah",
		note: "Six and one-half seasonal hours; practical preference can require waiting 30 ordinary minutes after chatzos."
	},
	{
		id: "minchaKetana", group: "afternoon", label: "Mincha Ketanah",
		note: "Nine and one-half seasonal hours after the day begins."
	},
	{
		id: "plag", group: "afternoon", label: "Plag HaMincha",
		note: "Ten and three-quarter seasonal hours after the day begins."
	},
	{
		id: "candleLighting", group: "afternoon", label: "Candle lighting — common 18 min",
		note: "A common default of 18 minutes before sunset; local customs can differ."
	},
	{
		id: "sunset", group: "evening", label: "Shkiah / Sunset",
		note: "Standard visible sunset using the conventional 0.833° center correction."
	},
	{
		id: "tzeis", group: "evening", label: "Tzeis HaKochavim",
		note: "Nightfall at 6° solar depression in the Chabad calculation method."
	},
	{
		id: "shabbosEnd", group: "evening", label: "Shabbos / Yom Tov ends",
		note: "8.5° solar depression in the published Chabad method."
	},
	{
		id: "rabbeinuTam72", group: "evening", label: "Rabbeinu Tam — 72 minutes",
		note: "Fixed 72 minutes after standard sunset, shown as an additional benchmark."
	},
	{
		id: "chatzosHalailah", group: "evening", label: "Chatzos HaLailah",
		note: "Midpoint from true sunset to the following true sunrise in the Chabad method."
	}
]);
