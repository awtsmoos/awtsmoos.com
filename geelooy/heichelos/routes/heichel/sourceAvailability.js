//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file Public availability policy for preserved-but-empty Ikar source identities.
 * @description The Awtsmoos preserves every archaeological vessel while public study doors open only onto actual Torah.
 * Awtsmoos.com hides these proven-empty identities wherever presentation aliases surface them, without deleting or rewriting Dayuh authority.
 */
const ROOT_PLACEHOLDER_SERIES = new Set([
	"hayomYomRebbe",
	"imreiBina",
	"keserShemTov",
	"kuntressUmayan",
	"neirMitzvah",
	"pirushHamilos",
	"shareiOhra",
	"shareiTeshuva"
]);

/** Returns true only for source identities proven by the canonical Dayuh census to be placeholder-only inside Ikar. */
function isPlaceholderSourceStub(heichelId, _parentSeriesId, seriesId) {
	if (String(heichelId) !== "ikar") return false;
	return ROOT_PLACEHOLDER_SERIES.has(String(seriesId || ""));
}

/** Filters only proven placeholder-only Ikar identities without modifying persistent Dayuh authority. */
function availableSeriesItems(heichelId, parentSeriesId, items = []) {
	return items.filter(item => !isPlaceholderSourceStub(
		heichelId,
		parentSeriesId,
		item?.id || item?.seriesId || item
	));
}

module.exports = {
	ROOT_PLACEHOLDER_SERIES,
	availableSeriesItems,
	isPlaceholderSourceStub
};
