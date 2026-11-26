//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module RebbeApiCatalog
 * @description
 * The catalog of Hebrew months and years for the Rebbe sichos search API.
 * Months mirror geelooy/apps/rebbe/search.js (HEBREW_MONTHS); the year to
 * Archive.org item map is read at runtime from the front end's own store
 * (geelooy/apps/rebbe/modules/store.js, YEARS) so the API can never drift
 * from the archive the front end actually browses.
 */

const fs = require("fs");
const path = require("path");

const MONTHS = [
	{ id: 1, name: "Tishrei" }, { id: 2, name: "Cheshvan" },
	{ id: 3, name: "Kislev" }, { id: 4, name: "Teves" },
	{ id: 5, name: "Shevat" }, { id: 6, name: "Adar" },
	{ id: 7, name: "Nissan" }, { id: 8, name: "Iyar" },
	{ id: 9, name: "Sivan" }, { id: 10, name: "Tammuz" },
	{ id: 11, name: "Menachem Av" }, { id: 12, name: "Elul" }
];

const MONTH_BUCKET = "months-1764928230";
const DAY_BUCKET = "days-1764928230";

/** Direct healthy replicas for the two search shards, same as the front end. */
const SHARD_DIRECT_BASES = {
	[MONTH_BUCKET]: "https://ia800605.us.archive.org/22/items/months-1764928230",
	[DAY_BUCKET]: "https://ia802809.us.archive.org/2/items/days-1764928230"
};

let yearsCache = null;

/**
 * Reads the YEARS map (Hebrew year -> Archive.org item id) from the front
 * end's store module. Parsed, never eval'd.
 * @returns {Object<string,string>} Year map, possibly empty on read failure.
 */
function loadYears() {
	if (yearsCache) return yearsCache;
	try {
		const storePath = path.join(__dirname, "..", "..", "..", "apps", "rebbe", "modules", "store.js");
		const text = fs.readFileSync(storePath, "utf8");
		const match = text.match(/export const YEARS\s*=\s*(\{[\s\S]*?\});/);
		if (match) yearsCache = JSON.parse(match[1]);
	} catch (error) {
		console.error("Rebbe API: could not read YEARS from front-end store", error);
	}
	if (!yearsCache) yearsCache = {};
	return yearsCache;
}

/** @returns {string[]} Sorted Hebrew years known to the archive. */
function yearList() {
	return Object.keys(loadYears()).sort((a, b) => Number(a) - Number(b));
}

/** Resolves a Hebrew year (or an item id directly) to an Archive.org item id. */
function itemForYear(year) {
	const years = loadYears();
	if (years[year]) return years[year];
	if (Object.values(years).includes(String(year))) return String(year);
	return null;
}

module.exports = {
	MONTHS,
	MONTH_BUCKET,
	DAY_BUCKET,
	SHARD_DIRECT_BASES,
	loadYears,
	yearList,
	itemForYear
};
