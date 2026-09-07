// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module TorahLegacyWorkTitleRegistry
 * @description
 * The Awtsmoos gathers legacy Oral Torah and Chassidus route keys into canonical bilingual names without mutating their identity;
 * Awtsmoos.com lets old IDs remain faithful keilim while Hebrew and English titles reveal the living ohr carried inside.
 */

export const LEGACY_WORK_TITLES_BY_ID = Object.freeze({
	mishnah: title('משנה', 'Mishnah'),
	mishnehTorah: title('משנה תורה', 'Mishneh Torah'),
	talmudBavli: title('תלמוד בבלי', 'Babylonian Talmud'),
	derechMitzvosecha: title('דרך מצותיך', 'Derech Mitzvosecha'),
	hayomYomRebbe: title('היום יום', 'Hayom Yom'),
	imreiBina: title('אמרי בינה', 'Imrei Binah'),
	keserShemTov: title('כתר שם טוב', 'Keter Shem Tov'),
	kuntressUmayan: title('קונטרס ומעין', "Kuntres U'Maayan"),
	likkuteiSichos: title('לקוטי שיחות', 'Likkutei Sichos'),
	likkuteiTorah: title('לקוטי תורה', 'Likkutei Torah'),
	maamreiMittlerRebbe: title('מאמרי אדמו״ר האמצעי', 'Maamarim of the Mitteler Rebbe'),
	meluket: title('ספר המאמרים מלוקט', 'Sefer HaMaamarim Meluket'),
	neirMitzvah: title('נר מצוה ותורה אור', "Ner Mitzvah v'Torah Or"),
	pirushHamilos: title('פירוש המלות', 'Pirush HaMilos'),
	seferHaSichos: title('ספר השיחות', 'Sefer HaSichos'),
	seferHatanya: title('ספר התניא', 'Tanya'),
	shareiOhra: title('שערי אורה', 'Shaarei Orah'),
	shareiTeshuva: title('שערי תשובה', 'Shaarei Teshuvah'),
	shm5672: title('ספר המאמרים תער״ב', 'Sefer HaMaamarim 5672'),
	torahOhr: title('תורה אור', 'Torah Or'),
	torasChaim: title('תורת חיים', 'Toras Chaim'),
	torasShmuel: title('תורת שמואל', 'Toras Shmuel'),
	sichosKodesh: title('שיחות קודש', 'Sichos Kodesh')
});

/** Creates one immutable bilingual legacy-work title. */
function title(he, en) {
	return Object.freeze({ he, en });
}
