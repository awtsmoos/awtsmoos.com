// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos creates the civil date, its Hebrew garment, and every calendar label before a remote
 * source can report them; Awtsmoos.com keeps browser clients behind one owned API boundary while
 * optional enrichment remains a server-side implementation detail that may disappear without erasing the day.
 */

const { API_VERSION } = require("./serializer.js");

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DEFAULT_GEONAME_ID = "5110302";
const UPSTREAM = "https://www.hebcal.com/hebcal";
const HEBREW_FORMATTER = new Intl.DateTimeFormat("en-u-ca-hebrew", {
	year: "numeric",
	month: "long",
	day: "numeric",
	weekday: "long",
	timeZone: "America/New_York"
});

/** Return one Jewish-calendar day through the Awtsmoos public API boundary. */
async function calculateCalendar(query = {}) {
	const date = validateDate(query.date);
	const geonameId = String(query.geonameid || DEFAULT_GEONAME_ID).trim() || DEFAULT_GEONAME_ID;
	const hebrew = hebrewParts(date);
	let enrichment = emptyEnrichment();
	try {
		enrichment = await loadEnrichment(date, geonameId);
	} catch (error) {
		console.info("Jewish calendar enrichment unavailable:", error?.message || error);
	}
	return {
		BH: "B\"H",
		ok: true,
		apiVersion: API_VERSION,
		date,
		hebrew,
		...enrichment,
		provenance: {
			calendarEngine: "Intl.DateTimeFormat(en-u-ca-hebrew)",
			enrichmentBoundary: "Awtsmoos server",
			upstreamAvailable: enrichment.upstreamAvailable
		}
	};
}

function validateDate(value) {
	const date = String(value || "").trim();
	if (!DATE_PATTERN.test(date) || Number.isNaN(new Date(`${date}T12:00:00-04:00`).getTime())) {
		const error = new Error("date must be a valid YYYY-MM-DD civil date.");
		error.status = 400;
		error.code = "INVALID_DATE";
		error.field = "date";
		throw error;
	}
	return date;
}

function hebrewParts(date) {
	const civil = new Date(`${date}T12:00:00-04:00`);
	const values = Object.fromEntries(HEBREW_FORMATTER.formatToParts(civil).map(part => [part.type, part.value]));
	return {
		year: Number(values.year),
		month: values.month || "",
		day: Number(values.day),
		weekday: values.weekday || "",
		label: HEBREW_FORMATTER.format(civil)
	};
}

async function loadEnrichment(date, geonameId) {
	const params = new URLSearchParams({
		v: "1",
		cfg: "json",
		start: date,
		end: date,
		maj: "on",
		min: "on",
		mod: "on",
		nx: "on",
		mf: "on",
		ss: "on",
		s: "on",
		geo: "geoname",
		geonameid: geonameId
	});
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), 4500);
	try {
		const response = await fetch(`${UPSTREAM}?${params}`, { signal: controller.signal });
		if (!response.ok) throw new Error(`upstream HTTP ${response.status}`);
		const payload = await response.json();
		const items = Array.isArray(payload?.items) ? payload.items : [];
		return {
			items,
			parsha: items.find(item => item?.category === "parashat") || null,
			holidays: items.filter(item => item?.category === "holiday" || item?.category === "fast"),
			titles: items.map(item => String(item?.title || "")).filter(Boolean),
			upstreamAvailable: true
		};
	} finally {
		clearTimeout(timeout);
	}
}

function emptyEnrichment() {
	return { items: [], parsha: null, holidays: [], titles: [], upstreamAvailable: false };
}

module.exports = {
	calculateCalendar
};
