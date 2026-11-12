// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module TorahTitleRegistry
 * @description
 * The Awtsmoos joins stable route identities with canonical Hebrew and English names while every key remains unchanged beneath;
 * Awtsmoos.com gathers Tanach, Bavli, Oral Torah, and Chassidus roots into one registry so internal vessels never masquerade as public light.
 */

import { BAVLI_TITLES_BY_ID } from './torahBavliTitleRegistry.js?v=torah-bilingual-004';
import { TANACH_TITLES_BY_ID } from './torahTanachTitleRegistry.js?v=torah-bilingual-003';
import { LEGACY_WORK_TITLES_BY_ID } from './torahLegacyWorkTitleRegistry.js?v=torah-bilingual-003';
import { MISHNAH_TITLES_BY_HEBREW } from './torahMishnahTitleRegistry.js';

const BY_ID = Object.freeze({
	root: pair('שורש', 'Root'),
	theWrittenTorah: pair('תורה שבכתב', 'The Written Torah'),
	theOralTorah: pair('תורה שבעל פה', 'The Oral Torah'),
	chassidus: pair('חסידות', 'Chassidus'),
	halacha: pair('הלכה', 'Halacha'),
	midrash: pair('מדרש', 'Midrash'),
	kabbalah: pair('קבלה', 'Kabbalah'),
	mussar: pair('מוסר', 'Mussar'),
	'torah-language-tools': pair('תרגומים ומילון', 'Translations & Dictionary'),
	'daily-chitas': pair('חת״ת יומי', 'Daily Chitas'),
	ayinBeisVolume1: pair('חלק ראשון', 'Part One'),
	ayinBeisVolume2: pair('חלק שני', 'Part Two'),
	ayinBeisVolume3: pair('חלק שלישי', 'Part Three'),
	// B"H 2026-11-12 title sweep: curated English for every live ikar series title
	// that resolved by humanized-ID fallback. Grouped: Mishnah tractates (Hebrew in id),
	// Mishneh Torah sections, then the remaining series. No Hebrew invented: he is
	// '' where the stored series carries no Hebrew name.
	// --- Mishnah tractates (4) ---
	"BH-mishnah-ערלה": pair("ערלה", "Orlah"),
	"BH-mishnah-פאה": pair("פאה", "Peah"),
	"BH-mishnah-פסחים": pair("פסחים", "Pesachim"),
	"BH-mishnah-פרה": pair("פרה", "Parah"),
	// --- Mishneh Torah sections (85) ---
	"BH_rambam_acquisitionAndGifts": pair("", "Acquisition and Gifts"),
	"BH_rambam_agentsAndPartners": pair("", "Agents and Partners"),
	"BH_rambam_blessings": pair("", "Blessings"),
	"BH_rambam_borrowingAndDeposits": pair("", "Borrowing and Deposits"),
	"BH_rambam_characterTraits": pair("", "Character Traits"),
	"BH_rambam_circumcision": pair("", "Circumcision"),
	"BH_rambam_commandmentsInstructingUsWhatNotToDo": pair("", "Commandments Instructing Us What Not to Do"),
	"BH_rambam_commandmentsInstructingUsWhatToDo": pair("", "Commandments Instructing Us What to Do"),
	"BH_rambam_dailyAndAdditionalOfferings": pair("", "Daily and Additional Offerings"),
	"BH_rambam_disqualifiedConsecratedItems": pair("", "Disqualified Consecrated Items"),
	"BH_rambam_divorce": pair("", "Divorce"),
	"BH_rambam_enteringTheTemple": pair("", "Entering the Temple"),
	"BH_rambam_fasts": pair("", "Fasts"),
	"BH_rambam_festivalOffering": pair("", "Festival Offering"),
	"BH_rambam_firstborn": pair("", "Firstborn"),
	"BH_rambam_firstFruits": pair("", "First Fruits and Other Priestly Gifts Outside the Temple"),
	"BH_rambam_forbiddenFoods": pair("", "Forbidden Foods"),
	"BH_rambam_forbiddenRelations": pair("", "Forbidden Relations"),
	"BH_rambam_foundationsOfTheTorah": pair("", "Foundations of the Torah"),
	"BH_rambam_fringes": pair("", "Fringes"),
	"BH_rambam_giftsToThePoor": pair("", "Gifts to the Poor"),
	"BH_rambam_hiring": pair("", "Hiring"),
	"BH_rambam_idolatry": pair("", "Idolatry"),
	"BH_rambam_impurityOfBedsAndSeats": pair("", "Impurity of Beds and Seats"),
	"BH_rambam_impurityOfFoods": pair("", "Impurity of Foods"),
	"BH_rambam_impurityOfTheDead": pair("", "Impurity of the Dead"),
	"BH_rambam_impurityOfTzaraAt": pair("", "Impurity of Tzara'at"),
	"BH_rambam_inheritances": pair("", "Inheritances"),
	"BH_rambam_injuryAndDamage": pair("", "Injury and Damage"),
	"BH_rambam_introduction": pair("", "Introduction"),
	"BH_rambam_kingsAndWars": pair("", "Kings and Wars"),
	"BH_rambam_lawsOfPropertyDamage": pair("", "Laws of Property Damage"),
	"BH_rambam_leavenAndMatzah": pair("", "Leaven and Matzah"),
	"BH_rambam_lenderAndBorrower": pair("", "Lender and Borrower"),
	"BH_rambam_levirateMarriageAndRelease": pair("", "Levirate Marriage and Release"),
	"BH_rambam_listingOfAll613Commandments": pair("", "Listing of All 613 Commandments"),
	"BH_rambam_marriage": pair("", "Marriage"),
	"BH_rambam_misuseOfConsecratedProperty": pair("", "Misuse of Consecrated Property"),
	"BH_rambam_mixedSpecies": pair("", "Mixed Species"),
	"BH_rambam_mourning": pair("", "Mourning"),
	"BH_rambam_murderAndPreservationOfLife": pair("", "Murder and Preservation of Life"),
	"BH_rambam_naziriteVows": pair("", "Nazirite Vows"),
	"BH_rambam_neighbors": pair("", "Neighbors"),
	"BH_rambam_oaths": pair("", "Oaths"),
	"BH_rambam_offeringProcedures": pair("", "Offering Procedures"),
	"BH_rambam_orderOfPrayers": pair("", "Order of Prayers"),
	"BH_rambam_otherSourcesOfImpurity": pair("", "Other Sources of Impurity"),
	"BH_rambam_passoverOffering": pair("", "Passover Offering"),
	"BH_rambam_plaintiffAndDefendant": pair("", "Plaintiff and Defendant"),
	"BH_rambam_prayerAndPriestlyBlessing": pair("", "Prayer and Priestly Blessing"),
	"BH_rambam_priestlyPortions": pair("", "Priestly Portions"),
	"BH_rambam_prohibitionsOfTheAltar": pair("", "Prohibitions of the Altar"),
	"BH_rambam_rebelliousOnes": pair("", "Rebellious Ones"),
	"BH_rambam_recitationOfShema": pair("", "Recitation of Shema"),
	"BH_rambam_redHeifer": pair("", "Red Heifer"),
	"BH_rambam_repentance": pair("", "Repentance"),
	"BH_rambam_restingOnFestivals": pair("", "Resting on Festivals"),
	"BH_rambam_restingOnTheTenth": pair("", "Resting on the Tenth"),
	"BH_rambam_ritualBaths": pair("", "Ritual Baths"),
	"BH_rambam_ritualSlaughter": pair("", "Ritual Slaughter"),
	"BH_rambam_robberyAndLostProperty": pair("", "Robbery and Lost Property"),
	"BH_rambam_sabbath": pair("", "Sabbath"),
	"BH_rambam_sabbaticalYear": pair("", "Sabbatical Year and Jubilee"),
	"BH_rambam_sales": pair("", "Sales"),
	"BH_rambam_sanctificationOfTheNewMonth": pair("", "Sanctification of the New Month"),
	"BH_rambam_secondTithe": pair("", "Second Tithe and Fourth-Year Planting"),
	"BH_rambam_serviceOfYomKippur": pair("", "Service of Yom Kippur"),
	"BH_rambam_shekels": pair("", "Shekels"),
	"BH_rambam_shofarSukkahAndLulav": pair("", "Shofar Sukkah and Lulav"),
	"BH_rambam_slaves": pair("", "Slaves"),
	"BH_rambam_substitution": pair("", "Substitution"),
	"BH_rambam_tefillinMezuzahAndTorahScroll": pair("", "Tefillin Mezuzah and Torah Scroll"),
	"BH_rambam_templeVessels": pair("", "Temple Vessels"),
	"BH_rambam_testimony": pair("", "Testimony"),
	"BH_rambam_theChosenHouse": pair("", "The Chosen House"),
	"BH_rambam_theft": pair("", "Theft"),
	"BH_rambam_theScrollOfPurimAndHanukkah": pair("", "The Scroll of Purim and Hanukkah"),
	"BH_rambam_thoseLackingAtonement": pair("", "Those Lacking Atonement"),
	"BH_rambam_tithes": pair("", "Tithes"),
	"BH_rambam_torahStudy": pair("", "Torah Study"),
	"BH_rambam_unintentionalSins": pair("", "Unintentional Sins"),
	"BH_rambam_valuationsAndDevotions": pair("", "Valuations and Devotions"),
	"BH_rambam_vessels": pair("", "Vessels"),
	"BH_rambam_virginMaiden": pair("", "Virgin Maiden"),
	"BH_rambam_vows": pair("", "Vows"),
	// --- Remaining series (107) ---
	"BH-likkuteiTorah-במדבר-(וחה\"ש)": pair("במדבר (וחה\"ש)", "Bamidbar (and Chol HaMoed Sukkos)"),
	"BH-likkuteiTorah-דרושים-ליו\"כ": pair("דרושים ליו\"כ", "Discourses for Yom Kippur"),
	"BH-likkuteiTorah-דרושים-לסוכות-ושמ\"ע": pair("דרושים לסוכות ושמ\"ע", "Discourses for Sukkos and Shemini Atzeres"),
	"BH-likkuteiTorah-דרושים-לר\"ה-ועשי\"ת-ויוה\"כ": pair("דרושים לר\"ה ועשי\"ת ויוה\"כ", "Discourses for Rosh HaShanah, Aseres Yemei Teshuvah, and Yom Kippur"),
	"BH-likkuteiTorah-דרושים-לשמ\"ע": pair("דרושים לשמ\"ע", "Discourses for Shemini Atzeres"),
	"BH-likkuteiTorah-צו-(וחה\"פ)": pair("צו (וחה\"פ)", "Tzav (and Chol HaMoed Pesach)"),
	"biur-halachah-hebrew": pair("", "Biur Halachah"),
	"encyclopedia": pair("", "Encyclopedia"),
	"igeresHaKodesh": pair("", "Igeres HaKodesh"),
	"igeresHaKodeshVolume1": pair("", "Igeres HaKodesh Volume 1"),
	"igeresHaKodeshVolume10": pair("", "Igeres HaKodesh Volume 10"),
	"igeresHaKodeshVolume11": pair("", "Igeres HaKodesh Volume 11"),
	"igeresHaKodeshVolume12": pair("", "Igeres HaKodesh Volume 12"),
	"igeresHaKodeshVolume13": pair("", "Igeres HaKodesh Volume 13"),
	"igeresHaKodeshVolume14": pair("", "Igeres HaKodesh Volume 14"),
	"igeresHaKodeshVolume15": pair("", "Igeres HaKodesh Volume 15"),
	"igeresHaKodeshVolume16": pair("", "Igeres HaKodesh Volume 16"),
	"igeresHaKodeshVolume17": pair("", "Igeres HaKodesh Volume 17"),
	"igeresHaKodeshVolume18": pair("", "Igeres HaKodesh Volume 18"),
	"igeresHaKodeshVolume19": pair("", "Igeres HaKodesh Volume 19"),
	"igeresHaKodeshVolume2": pair("", "Igeres HaKodesh Volume 2"),
	"igeresHaKodeshVolume20": pair("", "Igeres HaKodesh Volume 20"),
	"igeresHaKodeshVolume21": pair("", "Igeres HaKodesh Volume 21"),
	"igeresHaKodeshVolume22": pair("", "Igeres HaKodesh Volume 22"),
	"igeresHaKodeshVolume23": pair("", "Igeres HaKodesh Volume 23"),
	"igeresHaKodeshVolume24": pair("", "Igeres HaKodesh Volume 24"),
	"igeresHaKodeshVolume25": pair("", "Igeres HaKodesh Volume 25"),
	"igeresHaKodeshVolume26": pair("", "Igeres HaKodesh Volume 26"),
	"igeresHaKodeshVolume27": pair("", "Igeres HaKodesh Volume 27"),
	"igeresHaKodeshVolume28": pair("", "Igeres HaKodesh Volume 28"),
	"igeresHaKodeshVolume3": pair("", "Igeres HaKodesh Volume 3"),
	"igeresHaKodeshVolume4": pair("", "Igeres HaKodesh Volume 4"),
	"igeresHaKodeshVolume5": pair("", "Igeres HaKodesh Volume 5"),
	"igeresHaKodeshVolume6": pair("", "Igeres HaKodesh Volume 6"),
	"igeresHaKodeshVolume7": pair("", "Igeres HaKodesh Volume 7"),
	"igeresHaKodeshVolume8": pair("", "Igeres HaKodesh Volume 8"),
	"igeresHaKodeshVolume9": pair("", "Igeres HaKodesh Volume 9"),
	"iggeresHakodesh": pair("", "Iggeres Hakodesh"),
	"iggeresHateshuvah": pair("", "Iggeres Hateshuvah"),
	"kuntresAcharon": pair("", "Kuntres Acharon"),
	"likutteiAmarim": pair("", "Likkutei Amarim"),
	"midrash-birkat-yaakov": pair("", "Midrash Birkat Yaakov"),
	"midrash-halel": pair("", "Midrash Halel"),
	"midrash-rabbah-bamidbar": pair("", "Bamidbar Rabbah"),
	"midrash-rabbah-bereishit": pair("", "Bereishit Rabbah"),
	"midrash-rabbah-devarim": pair("", "Devarim Rabbah"),
	"midrash-rabbah-shemot": pair("", "Shemot Rabbah"),
	"midrash-rabbah-vayikra": pair("", "Vayikra Rabbah"),
	"mishnah-berurah-hebrew": pair("", "Mishnah Berurah"),
	"rashi-bavli": pair("", "Rashi on Talmud Bavli"),
	"rashi-bavli-arakhin": pair("", "Rashi on Arakhin"),
	"rashi-bavli-avodah-zarah": pair("", "Rashi on Avodah Zarah"),
	"rashi-bavli-bava-batra": pair("", "Rashi on Bava Batra"),
	"rashi-bavli-beitzah": pair("", "Rashi on Beitzah"),
	"rashi-bavli-bekhorot": pair("", "Rashi on Bekhorot"),
	"rashi-bavli-berakhot": pair("", "Rashi on Berakhot"),
	"rashi-bavli-chagigah": pair("", "Rashi on Chagigah"),
	"rashi-bavli-gittin": pair("", "Rashi on Gittin"),
	"rashi-bavli-horayot": pair("", "Rashi on Horayot"),
	"rashi-bavli-keritot": pair("", "Rashi on Keritot"),
	"rashi-bavli-ketubot": pair("", "Rashi on Ketubot"),
	"rashi-bavli-kiddushin": pair("", "Rashi on Kiddushin (by daf)"),
	"rashi-bavli-ktav-yad-bekhorot": pair("", "Ktav Yad Rashi on Bekhorot"),
	"rashi-bavli-ktav-yad-menachot": pair("", "Ktav Yad Rashi on Menachot"),
	"rashi-bavli-makkot": pair("", "Rashi on Makkot"),
	"rashi-bavli-megillah": pair("", "Rashi on Megillah"),
	"rashi-bavli-meilah": pair("", "Rashi on Meilah"),
	"rashi-bavli-menachot": pair("", "Rashi on Menachot"),
	"rashi-bavli-moed-katan": pair("", "Rashi on Moed Katan"),
	"rashi-bavli-nazir": pair("", "Rashi on Nazir"),
	"rashi-bavli-nedarim": pair("", "Rashi on Nedarim"),
	"rashi-bavli-niddah": pair("", "Rashi on Niddah"),
	"rashi-bavli-rosh-hashanah": pair("", "Rashi on Rosh Hashanah"),
	"rashi-bavli-shevuot": pair("", "Rashi on Shevuot"),
	"rashi-bavli-sotah": pair("", "Rashi on Sotah"),
	"rashi-bavli-sukkah": pair("", "Rashi on Sukkah"),
	"rashi-bavli-taanit": pair("", "Rashi on Taanit"),
	"rashi-bavli-temurah": pair("", "Rashi on Temurah"),
	"rashi-bavli-yoma": pair("", "Rashi on Yoma"),
	"rashi-midrash-bereshit-rabbah": pair("", "Rashi on Bereshit Rabbah"),
	"sefer-hayashar": pair("", "Sefer HaYashar"),
	"shaar-hatziyun-hebrew": pair("", "Shaar HaTziyun"),
	"shaArHayichudVihaemunah": pair("", "Sha'ar Hayichud Vihaemunah"),
	"shulchan-aruch-beerheitev-hebrew": pair("", "Be’er Heitev"),
	"shulchan-aruch-biurgra-hebrew": pair("", "Biur HaGra"),
	"shulchan-aruch-harav-hebrew": pair("", "Shulchan Aruch HaRav"),
	"shulchan-aruch-kafhachaim-hebrew": pair("", "Kaf HaChaim"),
	"shulchan-aruch-pitcheitshuva-hebrew": pair("", "Pitchei Teshuvah"),
	"shulchan-aruch-shach-hebrew": pair("", "Shach"),
	"simulation": pair("", "Simulation"),
	"torasChaim-בראשית1": pair("", "Toras Chaim, Bereishis I"),
	"torasChaim-בראשית2": pair("", "Toras Chaim, Bereishis II"),
	"torasChaim-שמות1": pair("", "Toras Chaim, Shemos I"),
	"torasChaim-שמות2": pair("", "Toras Chaim, Shemos II"),
	"torashShmuel-5627": pair("", "Toras Shmuel 5627"),
	"torashShmuel-5629": pair("", "Toras Shmuel 5629"),
	"torashShmuel-5638": pair("", "Toras Shmuel 5638"),
	"torashShmuel-5640": pair("", "Toras Shmuel 5640"),
	"torashShmuel-5641": pair("", "Toras Shmuel 5641"),
	"torashShmuel-5642": pair("", "Toras Shmuel 5642"),
	"torashShmuel-5643": pair("", "Toras Shmuel 5643"),
	"torashShmuel-5645": pair("", "Toras Shmuel 5645"),
	"torashShmuel-5648": pair("", "Toras Shmuel 5648"),
	"torashShmuel-5649": pair("", "Toras Shmuel 5649"),
	"torashShmuel-5650": pair("", "Toras Shmuel 5650"),
	"tur-hebrew": pair("", "Tur"),
	"yalkut-hamechiri": pair("", "Yalkut HaMechiri"),
	...TANACH_TITLES_BY_ID,
	...BAVLI_TITLES_BY_ID,
	...LEGACY_WORK_TITLES_BY_ID
});

const BY_HEBREW = Object.freeze({
	...MISHNAH_TITLES_BY_HEBREW,
	'תורה אור': 'Torah Or',
	'תורה אור (חב"ד)': 'Torah Or (Chabad)',
	'תניא': 'Tanya',
	'ליקוטי תורה': 'Likkutei Torah',
	'שולחן ערוך': 'Shulchan Aruch',
	'משנה ברורה': 'Mishnah Berurah',
	'ערוך השולחן': 'Aruch HaShulchan',
	'רי"ף': 'Rif',
	'קיצור שולחן ערוך': 'Kitzur Shulchan Aruch',
	'חובות הלבבות': 'Duties of the Heart',
	'מסילת ישרים': 'Mesillat Yesharim',
	'אורחות צדיקים': 'Orchot Tzaddikim',
	'שערי תשובה': 'Shaarei Teshuvah',
	'נפש החיים': 'Nefesh HaChaim',
	'ראשית חכמה': 'Reishit Chochmah',
	'דרך ה׳': 'Derech Hashem',
	'ספרי חסידות נוספים': 'Additional Chassidus Works',
	'חלק ראשון': 'Part One',
	'חלק שני': 'Part Two',
	'חלק שלישי': 'Part Three',
	// B"H 2026-11-12 title sweep: exact Hebrew strings that fell through to the
	// consonant-only transliterator (parsha spellings, suffixed forms, additions).
	"ספר המצות": "Sefer HaMitzvos",
	"מאמרי אדמו\"ר הצמח צדק": "Maamarim of the Tzemach Tzedek",
	"הוספות": "Additions",
	"אחרי מות": "Acharei Mos",
	"בחוקתי": "Bechukosai",
	"ויקרא הוספות": "Vayikra Additions",
	"בהעלותך": "Behaaloscha",
	"ראה (ואלול)": "Re'eh (and Elul)",
	"כי תבוא": "Ki Savo",
	"לשבת שובה": "For Shabbat Shuvah",
	"הנחות - תקע\"ז": "Transcriptions — 5577",
	"דרושי חתונה - ח״ב": "Wedding Discourses — Part 2",
	"קונטרסים": "Kuntresim",
	"וישב (וחנוכה)": "Vayeishev (and Chanukah)",
	"מקץ (וחנוכה)": "Mikeitz (and Chanukah)",
	"פרשת זכור": "Parshat Zachor",
	"מגלת אסתר": "Megillat Esther",
	"ויחי הוספות": "Vayechi Additions",
	"שמות הוספות": "Shemos Additions",
	"יתרו הוספות": "Yisro Additions",
	"תצוה הוספות": "Tetzaveh Additions",
	"כי תשא הוספות": "Ki Sisa Additions",
	"ויקהל הוספות": "Vayakhel Additions",
	"מגלת אסתר הוספות": "Megillat Esther Additions",
	'עוד דפים': 'More Pages'
});

/** Returns one canonical title pair for a stable route ID. */
export function titlePairById(id = '') {
	return BY_ID[String(id)] || null;
}

/** Returns a registered pair when a public stored name already matches one canonical title. */
export function titlePairByKnownName(value = '') {
	const normalized = String(value).trim();
	const direct = titlePairById(normalized);
	if (direct) {
		return direct;
	}
	return Object.values(BY_ID).find(({ he, en }) => (
		he === normalized
		|| en === normalized
	)) || null;
}

/** Returns a curated English companion for a known Hebrew source title. */
export function englishTitleForHebrew(title = '') {
	return BY_HEBREW[String(title).trim()] || '';
}

/** Lists registered nodes for diagnostics without exposing the mutable registry. */
export function registeredNodeTitles() {
	return Object.entries(BY_ID).map(([id, value]) => ({ id, ...value }));
}

/** Creates one immutable bilingual title pair. */
function pair(he, en) {
	return Object.freeze({ he, en });
}
