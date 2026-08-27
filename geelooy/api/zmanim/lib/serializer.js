//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews each instant while JSON asks for a stable human vessel;
 * Awtsmoos.com serializes every time explicitly so machine and reader meet on one level.
 */

const API_VERSION = "1.0.0";

/** Convert one Date-like value into a stable nullable ISO string. */
function isoInstant(value) {
	if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
		return null;
	}
	return value.toISOString();
}

/** Serialize one named zman with source definition and local display text. */
function serializeZman(definition, instant, formatter, timezone) {
	const available = instant instanceof Date && !Number.isNaN(instant.getTime());
	return {
		id: definition.id,
		label: definition.label,
		group: definition.group,
		note: definition.note,
		available,
		instant: available ? instant.toISOString() : null,
		display: available ? formatter.time(instant, timezone) : null
	};
}

/** Serialize the pure domain result without changing any calculation. */
function serializeDay(input, solar, calculation, core) {
	const formatter = core.timezone.MalchusTimeFormatter;
	const definitions = core.zmanim.ZMAN_DEFINITIONS;
	const zmanim = [];
	for (const definition of definitions) {
		zmanim.push(
			serializeZman(definition, calculation.times[definition.id], formatter, input.timezone)
		);
	}
	return {
		BH: "B\"H",
		ok: true,
		apiVersion: API_VERSION,
		date: input.date,
		location: {
			label: input.label,
			latitude: input.latitude,
			longitude: input.longitude,
			timezone: input.timezone
		},
		opinion: calculation.opinion,
		shaahZmanis: {
			milliseconds: Number.isFinite(calculation.shaahMillis) ? calculation.shaahMillis : null,
			minutes: Number.isFinite(calculation.shaahMillis) ? calculation.shaahMillis / 60000 : null,
			display: formatter.seasonalHour(calculation.shaahMillis)
		},
		anchors: {
			alos: isoInstant(solar.alos),
			misheyakir: isoInstant(solar.misheyakir),
			sunrise: isoInstant(solar.sunrise),
			trueSunrise: isoInstant(solar.trueSunrise),
			solarNoon: isoInstant(solar.solarNoon),
			trueSunset: isoInstant(solar.trueSunset),
			sunset: isoInstant(solar.sunset),
			tzeis: isoInstant(solar.tzeis),
			shabbosEnd: isoInstant(solar.shabbosEnd),
			nextTrueSunrise: isoInstant(solar.nextTrueSunrise)
		},
		zmanim,
		warnings: [
			"Calculated zmanim contain unavoidable astronomical and methodological uncertainty.",
			"Local custom and practical halachic questions require a competent rav, especially at unusual latitudes."
		]
	};
}

module.exports = {
	API_VERSION,
	isoInstant,
	serializeDay
};
