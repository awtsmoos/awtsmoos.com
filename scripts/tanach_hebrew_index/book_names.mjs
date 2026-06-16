// B"H
/**
 * @file book_names.mjs
 * @chapter Names Become Doors In The Palace Of Verses
 * @description Maps Hebrew book titles from Tanach.json into stable slugs.
 */

export const BOOK_SLUGS = new Map([
  ["בראשית", "bereishis"], ["שמות", "shemos"], ["ויקרא", "vayikra"],
  ["במדבר", "bamidbar"], ["דברים", "devarim"], ["יהושע", "yehoshua"],
  ["שופטים", "shoftim"], ["שמואל א", "shmuel_1"], ["שמואל ב", "shmuel_2"],
  ["מלכים א", "melachim_1"], ["מלכים ב", "melachim_2"], ["ישעיהו", "yeshayahu"],
  ["ירמיהו", "yirmiyahu"], ["יחזקאל", "yechezkel"], ["הושע", "hoshea"],
  ["יואל", "yoel"], ["עמוס", "amos"], ["עובדיה", "ovadiah"],
  ["יונה", "yonah"], ["מיכה", "michah"], ["נחום", "nachum"],
  ["חבקוק", "chavakuk"], ["צפניה", "tzefanyah"], ["חגי", "chagai"],
  ["זכריה", "zecharyah"], ["מלאכי", "malachi"], ["תהלים", "tehillim"],
  ["משלי", "mishlei"], ["איוב", "iyov"], ["שיר השירים", "shir_hashirim"],
  ["רות", "rus"], ["איכה", "eichah"], ["קהלת", "koheles"],
  ["אסתר", "esther"], ["דניאל", "daniel"], ["עזרא", "ezra"],
  ["נחמיה", "nechemyah"], ["דברי הימים א", "divrei_hayamim_1"],
  ["דברי הימים ב", "divrei_hayamim_2"]
]);

export function slugForBook(hebrewTitle = "") {
  const clean = String(hebrewTitle).replace(/[׳']/g, "").replace(/[\"״]/g, "").trim();
  return BOOK_SLUGS.get(clean) || encodeURIComponent(clean).replace(/%/g, "_").toLowerCase();
}
