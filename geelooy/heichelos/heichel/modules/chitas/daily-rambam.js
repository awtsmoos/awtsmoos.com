// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DailyRambam
 * @description
 * Daily Rambam (Mishneh Torah) schedule — BOTH tracks instituted by the
 * Rebbe in 1984, computed by pure arithmetic from the verified epoch.
 *
 * VERIFIED SCHEDULE FACTS (do not "fix" these from memory):
 * - Epoch: Sunday 27 Nisan 5744 = 1984-04-29. Both tracks start here.
 * - 3-chapters-a-day: 339-day cycle (1017 study units / 3). 46th cycle:
 *   2026-02-03 (Tu BiShvat 5786) .. 2027-01-07. Siyum celebrated 2027-01-10.
 * - 1-chapter-a-day: 1017-day cycle. 16th cycle: 2026-02-03 .. 2028-11-15.
 * - The 1017 units = 12 intro units + 1005 chapter-units. The intro is four
 *   sections studied in three portions each (days 1-12 of the 1-chapter
 *   track, days 1-4 of the 3-chapter track):
 *     1. Transmission of the Oral Law (the Hakdamah proper): 1-21, 22-33, 34-45
 *     2. Positive Mitzvot (248): 1-83, 84-166, 167-248
 *     3. Negative Mitzvot (365): 1-122, 123-245, 246-365
 *     4. Overview of Mishneh Torah Contents: 1:1-4:8, 5:1-9:9, 10:1-14:10
 * - Special divisions (the ONLY deviations from straight sequential chapters):
 *     a. "The Order of Prayer" (Seder HaTefillah, end of Sefer Ahavah):
 *        4 units in the 1-chapter track (last labelled "4-5"); 5 unit-slots
 *        in the 3-chapter track.
 *     b. "Leavened and Unleavened Bread" (Hilchot Chametz U'Matzah):
 *        9 units in the 1-chapter track (chapters 1-8 + the Haggadah text as
 *        unit 9); 8 units in the 3-chapter track, chapter 8 studied together
 *        with the Haggadah (labelled "8-9" when a day opens on chapter 8).
 *   (There is NO special division in Sefer Haflaah — it runs straight.)
 * - Section table and algorithm ported from hebcal/learning's rambam package
 *   (verified day-by-day against the published schedule over a 50-year span).
 *   Checkpoints: 2026-10-13 -> "Robbery and Lost Property 10-12" (3-chapter)
 *   and "Virgin Maiden 1" (1-chapter); 2020-07-09 -> "Kings and Wars 10-12"
 *   (last day of the 39th 3-chapter cycle); 2024-03-27 -> "Transmission of
 *   the Oral Law 1-45" (first day of the 45th 3-chapter cycle).
 *
 * Live-post coverage (audited 2026-10-13): our Rambam import holds 993 base
 * chapter posts. The following schedule units have NO live post (postId is
 * null for them; the card shows the label without an excerpt/link):
 *   - The Order of Prayer (all units; Seder HaTefillah not imported)
 *   - Leavened and Unleavened Bread 9 (the Haggadah text; 1-chapter track)
 *   - Sheqel Dues 4, Sabbatical Year and the Jubilee 13,
 *     Offerings for Unintentional Transgressions 13-15,
 *     Borrowing and Deposit 7-8 (chapters missing from the import)
 */

// Epoch: 27 Nisan 5744 (1984-04-29). Both cycles begin here.
export const RAMBAM_EPOCH_UTC = Date.UTC(1984, 3, 29);
export const RAMBAM3_CYCLE_LEN = 339;
export const RAMBAM1_CYCLE_LEN = 1017;
const DAY_MS = 86400000;

// Introductory sections: three study portions each (mitzvah/paragraph ranges,
// not chapters). [en, he, [portion1, portion2, portion3]]
const INTRO = [
  ['Transmission of the Oral Law', 'הקדמה', ['1-21', '22-33', '34-45']],
  ['Positive Mitzvot', 'מצות עשה', ['1-83', '84-166', '167-248']],
  ['Negative Mitzvot', 'מצות לא תעשה', ['1-122', '123-245', '246-365']],
  ['Overview of Mishneh Torah Contents', 'תוכן משנה תורה', ['1:1-4:8', '5:1-9:9', '10:1-14:10']],
];

// Section table in Mishneh Torah order: [en, he, sefer, slug, chapters].
// sefer/slug locate the live chapter post: rambam-<sefer> series,
// postId rambam-rambam-<sefer>-<sefer>-<slug>-p<NN>-rambam.
// slug is null where no chapter posts exist (intro sections, Order of Prayer).
const SECTIONS = [
  ...INTRO.map(([en, he]) => ({ en, he, sefer: null, slug: null, ch: 3, intro: true })),
  { en: 'Foundations of the Torah', he: 'הלכות יסודי התורה', sefer: 'madda', slug: 'yesodeihatorah', ch: 10 },
  { en: 'Human Dispositions', he: 'הלכות דעות', sefer: 'madda', slug: 'deot', ch: 7 },
  { en: 'Torah Study', he: 'הלכות תלמוד תורה', sefer: 'madda', slug: 'talmudtorah', ch: 7 },
  { en: 'Foreign Worship and Customs of the Nations', he: 'הלכות עבודת כוכבים', sefer: 'madda', slug: 'avodatkochavim', ch: 12 },
  { en: 'Repentance', he: 'הלכות תשובה', sefer: 'madda', slug: 'teshuvah', ch: 10 },
  { en: 'Reading the Shema', he: 'הלכות קריאת שמע', sefer: 'ahavah', slug: 'kriatshema', ch: 4 },
  { en: 'Prayer and the Priestly Blessing', he: 'הלכות תפלה וברכת כהנים', sefer: 'ahavah', slug: 'tefillahuvirkatkohanim', ch: 15 },
  { en: 'Tefillin, Mezuzah and the Torah Scroll', he: 'הלכות תפלין מזוזה וספר תורה', sefer: 'ahavah', slug: 'tefillinmezuzahvsefertorah', ch: 10 },
  { en: 'Fringes', he: 'הלכות ציצית', sefer: 'ahavah', slug: 'tzitzit', ch: 3 },
  { en: 'Blessings', he: 'הלכות ברכות', sefer: 'ahavah', slug: 'berachot', ch: 11 },
  { en: 'Circumcision', he: 'הלכות מילה', sefer: 'ahavah', slug: 'milah', ch: 3 },
  { en: 'The Order of Prayer', he: 'סדר התפלה', sefer: 'ahavah', slug: null, ch: 4, ch3: 5 },
  { en: 'Sabbath', he: 'הלכות שבת', sefer: 'zemanim', slug: 'shabbat', ch: 30 },
  { en: 'Eruvin', he: 'הלכות עירובין', sefer: 'zemanim', slug: 'eruvin', ch: 8 },
  { en: 'Rest on the Tenth of Tishrei', he: 'הלכות שביתת עשור', sefer: 'zemanim', slug: 'shevitatasor', ch: 3 },
  { en: 'Rest on a Holiday', he: 'הלכות שביתת יום טוב', sefer: 'zemanim', slug: 'shevitatyomtov', ch: 8 },
  { en: 'Leavened and Unleavened Bread', he: 'הלכות חמץ ומצה', sefer: 'zemanim', slug: 'chametzumatzah', ch: 9, ch3: 8 },
  { en: 'Shofar, Sukkah and Lulav', he: 'הלכות שופר סוכה ולולב', sefer: 'zemanim', slug: 'shofarsukkahvlulav', ch: 8 },
  { en: 'Sheqel Dues', he: 'הלכות שקלים', sefer: 'zemanim', slug: 'shekalim', ch: 4 },
  { en: 'Sanctification of the New Month', he: 'הלכות קידוש החדש', sefer: 'zemanim', slug: 'kiddushhachodesh', ch: 19 },
  { en: 'Fasts', he: 'הלכות תעניות', sefer: 'zemanim', slug: 'taaniyot', ch: 5 },
  { en: 'Scroll of Esther and Hanukkah', he: 'הלכות מגלה וחנוכה', sefer: 'zemanim', slug: 'chanukahumegillah', ch: 4 },
  { en: 'Marriage', he: 'הלכות אישות', sefer: 'nashim', slug: 'ishut', ch: 25 },
  { en: 'Divorce', he: 'הלכות גירושין', sefer: 'nashim', slug: 'gerushin', ch: 13 },
  { en: 'Levirate Marriage and Release', he: 'הלכות יבום וחליצה', sefer: 'nashim', slug: 'yibbumvchalitzah', ch: 8 },
  { en: 'Virgin Maiden', he: 'הלכות נערה בתולה', sefer: 'nashim', slug: 'naarahbetulah', ch: 3 },
  { en: 'Woman Suspected of Infidelity', he: 'הלכות סוטה', sefer: 'nashim', slug: 'sotah', ch: 4 },
  { en: 'Forbidden Intercourse', he: 'הלכות איסורי ביאה', sefer: 'kedushah', slug: 'issureibiah', ch: 22 },
  { en: 'Forbidden Foods', he: 'הלכות מאכלות אסורות', sefer: 'kedushah', slug: 'maachalotassurot', ch: 17 },
  { en: 'Ritual Slaughter', he: 'הלכות שחיטה', sefer: 'kedushah', slug: 'shechitah', ch: 14 },
  { en: 'Oaths', he: 'הלכות שבועות', sefer: 'haflaah', slug: 'shevuot', ch: 12 },
  { en: 'Vows', he: 'הלכות נדרים', sefer: 'haflaah', slug: 'nedarim', ch: 13 },
  { en: 'Nazariteship', he: 'הלכות נזירות', sefer: 'haflaah', slug: 'nezirut', ch: 10 },
  { en: 'Appraisals and Devoted Property', he: 'הלכות ערכים וחרמים', sefer: 'haflaah', slug: 'arachimvcharamim', ch: 8 },
  { en: 'Diverse Species', he: 'הלכות כלאים', sefer: 'zeraim', slug: 'kilayim', ch: 10 },
  { en: 'Gifts to the Poor', he: 'הלכות מתנות עניים', sefer: 'zeraim', slug: 'matnotaniyim', ch: 10 },
  { en: 'Heave Offerings', he: 'הלכות תרומות', sefer: 'zeraim', slug: 'terumot', ch: 15 },
  { en: 'Tithes', he: 'הלכות מעשר', sefer: 'zeraim', slug: 'maaser', ch: 14 },
  { en: "Second Tithes and Fourth Year's Fruit", he: 'הלכות מעשר שני ונטע רבעי', sefer: 'zeraim', slug: 'maasersheni', ch: 11 },
  { en: 'First Fruits', he: 'הלכות בכורים', sefer: 'zeraim', slug: 'bikkurim', ch: 12 },
  { en: 'Sabbatical Year and the Jubilee', he: 'הלכות שמיטה ויובל', sefer: 'zeraim', slug: 'shemitavyovel', ch: 13 },
  { en: 'The Chosen Temple', he: 'הלכות בית הבחירה', sefer: 'avodah', slug: 'beithabechirah', ch: 8 },
  { en: 'Vessels of the Sanctuary', he: 'הלכות כלי המקדש', sefer: 'avodah', slug: 'kleihamikdash', ch: 10 },
  { en: 'Admission into the Sanctuary', he: 'הלכות ביאת המקדש', sefer: 'avodah', slug: 'biathamikdash', ch: 9 },
  { en: 'Things Forbidden on the Altar', he: 'הלכות איסורי מזבח', sefer: 'avodah', slug: 'issureimizbeach', ch: 7 },
  { en: 'Sacrificial Procedure', he: 'הלכות מעשה הקרבנות', sefer: 'avodah', slug: 'maasehhakorbanot', ch: 19 },
  { en: 'Daily Offerings and Additional Offerings', he: 'הלכות תמידין ומוספין', sefer: 'avodah', slug: 'temidinumusafin', ch: 10 },
  { en: 'Sacrifices Rendered Unfit', he: 'הלכות פסולי המוקדשין', sefer: 'avodah', slug: 'pesuleihamukdashin', ch: 19 },
  { en: 'Service on the Day of Atonement', he: 'הלכות עבודת יום הכפורים', sefer: 'avodah', slug: 'avodatyomhakippurim', ch: 5 },
  { en: 'Trespass', he: 'הלכות מעילה', sefer: 'avodah', slug: 'meilah', ch: 8 },
  { en: 'Paschal Offering', he: 'הלכות קרבן פסח', sefer: 'korbanot', slug: 'korbanpesach', ch: 10 },
  { en: 'Festival Offering', he: 'הלכות חגיגה', sefer: 'korbanot', slug: 'chagigah', ch: 3 },
  { en: 'Firstlings', he: 'הלכות בכורות', sefer: 'korbanot', slug: 'bechorot', ch: 8 },
  { en: 'Offerings for Unintentional Transgressions', he: 'הלכות שגגות', sefer: 'korbanot', slug: 'shegagot', ch: 15 },
  { en: 'Offerings for Those with Incomplete Atonement', he: 'הלכות מחוסרי כפרה', sefer: 'korbanot', slug: 'mechusareikapparah', ch: 5 },
  { en: 'Substitution', he: 'הלכות תמורה', sefer: 'korbanot', slug: 'temurah', ch: 4 },
  { en: 'Defilement by a Corpse', he: 'הלכות טומאת מת', sefer: 'taharah', slug: 'tumatmet', ch: 25 },
  { en: 'Red Heifer', he: 'הלכות פרה אדומה', sefer: 'taharah', slug: 'parahadumah', ch: 15 },
  { en: 'Defilement by Leprosy', he: 'הלכות טומאת צרעת', sefer: 'taharah', slug: 'tumattzaraat', ch: 16 },
  { en: 'Those Who Defile Bed or Seat', he: 'הלכות מטמאי משכב ומושב', sefer: 'taharah', slug: 'metammeimishkavumoshav', ch: 13 },
  { en: 'Other Sources of Defilement', he: 'הלכות שאר אבות הטומאה', sefer: 'taharah', slug: 'shearavothatumah', ch: 20 },
  { en: 'Defilement of Foods', he: 'הלכות טומאת אוכלין', sefer: 'taharah', slug: 'tumatochalin', ch: 16 },
  { en: 'Vessels', he: 'הלכות כלים', sefer: 'taharah', slug: 'keilim', ch: 28 },
  { en: 'Immersion Pools', he: 'הלכות מקואות', sefer: 'taharah', slug: 'mikvaot', ch: 11 },
  { en: 'Damages to Property', he: 'הלכות נזקי ממון', sefer: 'nezikin', slug: 'nizkeimamon', ch: 14 },
  { en: 'Theft', he: 'הלכות גניבה', sefer: 'nezikin', slug: 'genevah', ch: 9 },
  { en: 'Robbery and Lost Property', he: 'הלכות גזילה ואבידה', sefer: 'nezikin', slug: 'gezelahvaavedah', ch: 18 },
  { en: 'One Who Injures a Person or Property', he: 'הלכות חובל ומזיק', sefer: 'nezikin', slug: 'chovelumazzik', ch: 8 },
  { en: 'Murderer and the Preservation of Life', he: 'הלכות רוצח ושמירת נפש', sefer: 'nezikin', slug: 'rotzeachushmiratnefesh', ch: 13 },
  { en: 'Sales', he: 'הלכות מכירה', sefer: 'kinyan', slug: 'mechirah', ch: 30 },
  { en: 'Ownerless Property and Gifts', he: 'הלכות זכיה ומתנה', sefer: 'kinyan', slug: 'zechiyahumattanah', ch: 12 },
  { en: 'Neighbors', he: 'הלכות שכנים', sefer: 'kinyan', slug: 'shechenim', ch: 14 },
  { en: 'Agents and Partners', he: 'הלכות שלוחין ושותפין', sefer: 'kinyan', slug: 'sheluchinvshuttafin', ch: 10 },
  { en: 'Slaves', he: 'הלכות עבדים', sefer: 'kinyan', slug: 'avadim', ch: 9 },
  { en: 'Hiring', he: 'הלכות שכירות', sefer: 'mishpatim', slug: 'sechirut', ch: 13 },
  { en: 'Borrowing and Deposit', he: 'הלכות שאלה ופקדון', sefer: 'mishpatim', slug: 'sheelahufikkadon', ch: 8 },
  { en: 'Creditor and Debtor', he: 'הלכות מלוה ולוה', sefer: 'mishpatim', slug: 'malvehvloveh', ch: 27 },
  { en: 'Plaintiff and Defendant', he: 'הלכות טוען ונטען', sefer: 'mishpatim', slug: 'toenvnitan', ch: 16 },
  { en: 'Inheritances', he: 'הלכות נחלות', sefer: 'mishpatim', slug: 'nachalot', ch: 11 },
  { en: 'The Sanhedrin', he: 'הלכות סנהדרין', sefer: 'shoftim', slug: 'sanhedrin', ch: 26 },
  { en: 'Testimony', he: 'הלכות עדות', sefer: 'shoftim', slug: 'edut', ch: 22 },
  { en: 'Rebels', he: 'הלכות ממרים', sefer: 'shoftim', slug: 'mamrim', ch: 7 },
  { en: 'Mourning', he: 'הלכות אבל', sefer: 'shoftim', slug: 'avel', ch: 14 },
  { en: 'Kings and Wars', he: 'הלכות מלכים ומלחמות', sefer: 'shoftim', slug: 'melachimumilchamot', ch: 12 },
];

// Chapter units known to have no live post in our Rambam import (audited).
// Key: "sefer:slug:chapter".
const MISSING_POSTS = new Set([
  'zemanim:chametzumatzah:9',   // the Haggadah text (1-chapter track unit 9)
  'zemanim:shekalim:4',
  'zeraim:shemitavyovel:13',
  'korbanot:shegagot:13',
  'korbanot:shegagot:14',
  'korbanot:shegagot:15',
  'mishpatim:sheelahufikkadon:7',
  'mishpatim:sheelahufikkadon:8',
]);

function sectionCh(sec, threeTrack) {
  if (threeTrack && sec.ch3) return sec.ch3;
  return sec.ch;
}

// The reading at 0-based unit index idx within the section table.
function getChap(idx, threeTrack) {
  let total = idx;
  for (let j = 0; j < SECTIONS.length; j++) {
    const sec = SECTIONS[j];
    const ch = sectionCh(sec, threeTrack);
    if (total < ch) {
      const n = total + 1;
      let perek;
      if (sec.intro) {
        perek = INTRO[j][2][n - 1];
      } else {
        perek = String(n);
      }
      return { sec, perek, unit: n };
    }
    total -= ch;
  }
  throw new Error(`B"H — rambam unit index out of range: ${idx}`);
}

function postIdFor(sec, chapterNum) {
  if (!sec.slug) return null;
  if (MISSING_POSTS.has(`${sec.sefer}:${sec.slug}:${chapterNum}`)) return null;
  const nn = String(chapterNum).padStart(2, '0');
  return `rambam-rambam-${sec.sefer}-${sec.sefer}-${sec.slug}-p${nn}-rambam`;
}

// Merge adjacent readings from the same section into one "X-Y" reading.
function collapseAdjacent(readings) {
  const out = [];
  let i = 0;
  while (i < readings.length) {
    let j = i;
    while (j + 1 < readings.length && readings[j + 1].sec.en === readings[i].sec.en) j++;
    if (j > i) {
      const start = readings[i].perek.split('-')[0];
      const parts = readings[j].perek.split('-');
      const end = parts[parts.length - 1];
      out.push({ ...readings[i], perek: `${start}-${end}` });
    } else {
      out.push(readings[i]);
    }
    i = j + 1;
  }
  return out;
}

// Number -> Hebrew numeral (1 -> א׳, 12 -> י״ב). Ranges pass through.
function hebrewNumeral(n) {
  if (n === 15) return 'ט״ו';
  if (n === 16) return 'ט״ז';
  const vals = [[400, 'ת'], [300, 'ש'], [200, 'ר'], [100, 'ק'], [90, 'צ'], [80, 'פ'], [70, 'ע'], [60, 'ס'], [50, 'נ'], [40, 'מ'], [30, 'ל'], [20, 'כ'], [10, 'י'], [9, 'ט'], [8, 'ח'], [7, 'ז'], [6, 'ו'], [5, 'ה'], [4, 'ד'], [3, 'ג'], [2, 'ב'], [1, 'א']];
  let out = '';
  let rest = n;
  for (const [v, ch] of vals) {
    while (rest >= v) { out += ch; rest -= v; }
  }
  if (out.length <= 1) return out + '׳';
  return out.slice(0, -1) + '״' + out.slice(-1);
}

function perekHe(perek, isIntro) {
  if (isIntro) return perek; // mitzvah/paragraph ranges stay in western numerals
  return perek
    .split('-')
    .map(part => (/^\d+$/.test(part) ? hebrewNumeral(parseInt(part, 10)) : part))
    .join('-');
}

function readingInfo(reading) {
  const { sec, perek } = reading;
  const isIntro = !!sec.intro;
  // First chapter number of the (possibly ranged) reading, for post lookup.
  const firstUnit = parseInt(perek.split(/[-:]/)[0], 10);
  const postId = !isIntro && /^\d+$/.test(String(firstUnit))
    ? postIdFor(sec, firstUnit)
    : null;
  const seriesId = sec.sefer ? `rambam-${sec.sefer}` : null;
  return {
    name: sec.en,
    nameHe: sec.he,
    perek,
    perekHe: perekHe(perek, isIntro),
    label: `${sec.en} ${perek}`,
    labelHe: `${sec.he} ${perekHe(perek, isIntro)}`,
    postId,
    seriesId,
    url: postId ? `/heichelos/rambam/series/${seriesId}/post/${postId}` : null,
  };
}

function daysSinceEpoch(date) {
  const d = date instanceof Date ? date : new Date(date);
  const utcDay = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  return Math.floor((utcDay - RAMBAM_EPOCH_UTC) / DAY_MS);
}

/**
 * The 3-chapters-a-day portion for a civil date.
 * @returns {{cycle, dayOfCycle, readings: Array, label, labelHe}}
 */
export function rambam3ForDate(date) {
  const days = daysSinceEpoch(date);
  if (days < 0) return null;
  const dno = days % RAMBAM3_CYCLE_LEN;
  const idx = dno * 3;
  const raw = [getChap(idx, true), getChap(idx + 1, true), getChap(idx + 2, true)];
  // Leavened and Unleavened Bread 8 is studied together with the Haggadah (unit 9).
  if (raw[0].sec.en === 'Leavened and Unleavened Bread' && raw[0].perek === '8') {
    raw[0] = { ...raw[0], perek: '8-9' };
  }
  const readings = collapseAdjacent(raw).map(readingInfo);
  return {
    cycle: Math.floor(days / RAMBAM3_CYCLE_LEN) + 1,
    dayOfCycle: dno + 1,
    cycleLen: RAMBAM3_CYCLE_LEN,
    readings,
    label: readings.map(r => r.label).join(', '),
    labelHe: readings.map(r => r.labelHe).join(', '),
  };
}

/**
 * The 1-chapter-a-day portion for a civil date.
 * @returns {{cycle, dayOfCycle, reading, label, labelHe}}
 */
export function rambam1ForDate(date) {
  const days = daysSinceEpoch(date);
  if (days < 0) return null;
  const dno = days % RAMBAM1_CYCLE_LEN;
  let raw = getChap(dno, false);
  // The Order of Prayer's final unit covers parts 4-5 together.
  if (raw.sec.en === 'The Order of Prayer' && raw.perek === '4') {
    raw = { ...raw, perek: '4-5' };
  }
  const reading = readingInfo(raw);
  return {
    cycle: Math.floor(days / RAMBAM1_CYCLE_LEN) + 1,
    dayOfCycle: dno + 1,
    cycleLen: RAMBAM1_CYCLE_LEN,
    reading,
    label: reading.label,
    labelHe: reading.labelHe,
  };
}

/**
 * Both Daily Rambam tracks for a civil date.
 * @param {Date} date Local civil date.
 * @returns {{track3, track1}} Each track carries cycle, dayOfCycle, bilingual
 * labels and live-post links (postId/url null where no post exists).
 */
export function rambamForDate(date) {
  return {
    track3: rambam3ForDate(date),
    track1: rambam1ForDate(date),
  };
}
