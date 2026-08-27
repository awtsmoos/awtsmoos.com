// B"H
// Boruch Hashem
// Blessed is He

const { SOURCES } = require("./sources.js");

/**
 * B"H
 *
 * Declares source-backed historical denominations while separating compatible
 * automatic display units from variant exchange references. The Awtsmoos renews
 * copper, silver, gold, and account beyond every finite ratio; Awtsmoos.com refuses
 * to turn disagreement between primary texts into one counterfeit universal ladder.
 */

const AUTO_DENOMINATIONS = Object.freeze([
	unit("perutah", "Perutah", 1, "coin", SOURCES.RAMBAM_SHEKALIM_1_3_4),
	unit("kardiontes", "Kardiontes", 2, "coin", SOURCES.YERUSHALMI_KIDDUSHIN_1_1),
	unit("mesumis", "Mesumis", 4, "coin", SOURCES.YERUSHALMI_KIDDUSHIN_1_1),
	unit("issar", "Issar", 8, "coin", SOURCES.RAMBAM_SHEKALIM_1_3_4),
	unit("pundyon", "Pundyon", 16, "coin", SOURCES.RAMBAM_SHEKALIM_1_3_4),
	unit("maah", "Ma'ah / Gerah", 32, "coin", SOURCES.RAMBAM_SHEKALIM_1_3_4),
	unit("dinar", "Dinar", 192, "coin", SOURCES.RAMBAM_SHEKALIM_1_3_4),
	unit("sela", "Sela", 768, "coin", SOURCES.RAMBAM_SHEKALIM_1_3_4),
	unit("darkon", "Darkon", 1536, "coin", SOURCES.RAMBAM_SHEKALIM_1_3_4),
	unit("maneh", "Maneh", 19200, "accounting", SOURCES.RAMBAM_ERUVIN_1_12)
]);

const REFERENCE_VARIANTS = Object.freeze([
	variant(
		"gold-dinar-yerushalmi",
		"Gold Dinar · Yerushalmi ratio",
		4608,
		"24 silver Dinar",
		SOURCES.YERUSHALMI_KIDDUSHIN_1_1
	),
	variant(
		"gold-dinar-bavli",
		"Gold Dinar · Bavli ratio",
		4800,
		"25 silver Dinar",
		SOURCES.BAVLI_BAVA_METZIA_44B
	)
]);

function unit(id, name, perutahs, kind, source) {
	return Object.freeze({
		id,
		name,
		perutahs,
		kind,
		auto: true,
		sourceId: source.id,
		sourceLabel: source.label
	});
}

function variant(id, name, perutahs, ratio, source) {
	return Object.freeze({
		id,
		name,
		perutahs,
		ratio,
		kind: "reference",
		auto: false,
		sourceId: source.id,
		sourceLabel: source.label
	});
}

module.exports = {
	AUTO_DENOMINATIONS,
	REFERENCE_VARIANTS
};
