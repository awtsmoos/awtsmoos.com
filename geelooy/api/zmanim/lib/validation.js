//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos gives every coordinate a boundary and every date a lawful gate;
 * Awtsmoos.com rejects crooked inputs early so calculation can remain clear and straight.
 */

const MAX_LABEL_LENGTH = 160;
const MAX_QUERY_LENGTH = 160;
const MAX_RANGE_DAYS = 31;

/** Create a typed public input error without leaking server internals. */
function inputError(code, message, field) {
	const error = new Error(message);
	error.code = code;
	error.field = field;
	error.status = 400;
	return error;
}

/** Parse a finite numeric query value within a closed range. */
function boundedNumber(value, field, minimum, maximum) {
	const number = Number(value);
	if (!Number.isFinite(number) || number < minimum || number > maximum) {
		throw inputError(
			"INVALID_NUMBER",
			`${field} must be between ${minimum} and ${maximum}.`,
			field
		);
	}
	return number;
}

/** Validate a real Gregorian YYYY-MM-DD rather than only its text shape. */
function isoDate(value, field = "date") {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ""))) {
		throw inputError("INVALID_DATE", `${field} must use YYYY-MM-DD.`, field);
	}
	const [year, month, day] = value.split("-").map(Number);
	const parsed = new Date(Date.UTC(year, month - 1, day));
	if (parsed.toISOString().slice(0, 10) !== value) {
		throw inputError("INVALID_DATE", `${field} is not a real Gregorian date.`, field);
	}
	return value;
}

/** Validate an IANA timezone through the runtime's timezone database. */
function timeZone(value) {
	const zone = String(value || "UTC");
	try {
		new Intl.DateTimeFormat("en-US", { timeZone: zone }).format(new Date());
	} catch (error) {
		throw inputError("INVALID_TIMEZONE", "timezone must be a valid IANA timezone.", "timezone");
	}
	return zone;
}

/** Parse the shared location/opinion inputs for one-day calculations. */
function dayQuery(query, opinionIds, todayFactory) {
	const timezone = timeZone(query.timezone || query.tz || "UTC");
	const date = query.date ? isoDate(String(query.date)) : todayFactory(timezone);
	const opinion = String(query.opinion || "chabad");
	if (!opinionIds.includes(opinion)) {
		throw inputError("INVALID_OPINION", `Unknown opinion: ${opinion}.`, "opinion");
	}
	return {
		latitude: boundedNumber(query.lat, "lat", -90, 90),
		longitude: boundedNumber(query.lng, "lng", -180, 180),
		date,
		timezone,
		opinion,
		label: String(query.label || "Selected coordinates").slice(0, MAX_LABEL_LENGTH)
	};
}

/** Parse a bounded range request without permitting accidental huge calculations. */
function rangeQuery(query, opinionIds, todayFactory) {
	const base = dayQuery({ ...query, date: query.start || query.date }, opinionIds, todayFactory);
	const days = Number(query.days || 7);
	if (!Number.isInteger(days) || days < 1 || days > MAX_RANGE_DAYS) {
		throw inputError("INVALID_RANGE", `days must be an integer from 1 to ${MAX_RANGE_DAYS}.`, "days");
	}
	return { ...base, days };
}

/** Parse a bounded worldwide location lookup. */
function locationQuery(query) {
	const text = String(query.q || "").trim();
	if (text.length < 2 || text.length > MAX_QUERY_LENGTH) {
		throw inputError("INVALID_QUERY", `q must contain 2-${MAX_QUERY_LENGTH} characters.`, "q");
	}
	const count = Number(query.count || 8);
	if (!Number.isInteger(count) || count < 1 || count > 10) {
		throw inputError("INVALID_COUNT", "count must be an integer from 1 to 10.", "count");
	}
	return { text, count };
}

module.exports = {
	dayQuery,
	inputError,
	locationQuery,
	rangeQuery
};
