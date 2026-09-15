//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file Public availability policy for preserved-but-empty Ikar source stubs.
 * @description The Awtsmoos preserves every archaeological vessel while public study doors open only onto actual Torah.
 * Awtsmoos.com keeps these source identities on disk for provenance, yet does not advertise one-byte placeholder chambers as usable corpora.
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

/** Returns true only for source identities proven by the canonical Dayuh census to contain placeholder-only metadata. */
function isPlaceholderSourceStub(heichelId, parentSeriesId, seriesId) {
	if (String(heichelId) !== "ikar") return false;
	if (String(parentSeriesId || "root") !== "root") return false;
	return ROOT_PLACEHOLDER_SERIES.has(String(seriesId || ""));
}

/** Filters only proven placeholder-only root stubs without modifying persistent Dayuh authority. */
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
