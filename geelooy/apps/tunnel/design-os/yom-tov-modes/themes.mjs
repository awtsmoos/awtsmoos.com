//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Yom Tov visual themes — one soul per holiday.
 * @description Each Yom Tov gets its own palette, mood, and voice. Themes are
 * data (not CSS strings) so tests can assert on them and the client can read
 * them. css.mjs turns a theme into a stylesheet; html.mjs into a notice.
 *
 * freeze: true  -> the Shabbos stillness applies (no melacha days)
 * freeze: false -> theme + notice only (Chanukah, Purim, Chol HaMoed, fasts)
 */

export const MODES = Object.freeze({
	"pesach": {
		he: "פסח", en: "Pesach",
		emoji: "🌾",
		line: "Clean, free, unleavened — a still page for the festival of freedom.",
		lineHe: "חג החרות",
		palette: { paper: "#fffef9", ink: "#191914", accent: "#8a6d1f", muted: "#6b6252" },
		freeze: true,
		mood: "stark",
	},
	"sukkos": {
		he: "סוכות", en: "Sukkot",
		emoji: "🍋",
		line: "Joy under open sky — a still page for the festival of booths.",
		lineHe: "זמן שמחתנו",
		palette: { paper: "#faf5e9", ink: "#3a2c17", accent: "#5f7f35", muted: "#7a6a4a" },
		freeze: true,
		mood: "airy",
	},
	"shavuos": {
		he: "שבועות", en: "Shavuot",
		emoji: "🌸",
		line: "Torah, given in love — a still page for the festival of weeks.",
		lineHe: "זמן מתן תורתנו",
		palette: { paper: "#f6faf2", ink: "#22331f", accent: "#3f7a34", muted: "#5f6f57" },
		freeze: true,
		mood: "lush",
	},
	"yamim-noraim": {
		he: "ימים נוראים", en: "Yamim Noraim",
		emoji: "🕯️",
		line: "Stillness before the King — a quiet page for the Days of Awe.",
		lineHe: "ימים נוראים",
		palette: { paper: "#f2efe8", ink: "#1e1c26", accent: "#2e3d5c", muted: "#5c5a66" },
		freeze: true,
		mood: "solemn",
	},
	"chanukah": {
		he: "חנוכה", en: "Chanukah",
		emoji: "🕎",
		line: "A little light pushes away darkness — kindle, remember, rejoice.",
		lineHe: "נר דלוק",
		palette: { paper: "#0f1830", ink: "#f3e9cf", accent: "#e8b923", muted: "#9a8f78" },
		freeze: false,
		mood: "luminous",
		dark: true,
	},
	"purim": {
		he: "פורים", en: "Purim",
		emoji: "🎭",
		line: "Joy beyond measure — the story turned, and so did the page.",
		lineHe: "ונהפוך הוא",
		palette: { paper: "#fff8ef", ink: "#33231a", accent: "#8e2f5c", muted: "#7a5f4a" },
		freeze: false,
		mood: "joyful",
	},
	"solemn": {
		he: "צום", en: "Fast Day",
		emoji: "🌑",
		line: "A subdued page for a day of fasting and return.",
		lineHe: "יום צום",
		palette: { paper: "#efece4", ink: "#26242a", accent: "#4a4a52", muted: "#6e6a60" },
		freeze: false,
		mood: "subdued",
	},
	"minor": {
		he: "יום טוב קטן", en: "Minor Festival",
		emoji: "🌿",
		line: "A gentle page for a day of quiet gladness.",
		lineHe: "יום שמחה",
		palette: { paper: "#faf7ef", ink: "#33302a", accent: "#7a6a3f", muted: "#6f675a" },
		freeze: false,
		mood: "gentle",
	},
});

/** Theme record for a mode key; falls back to "minor". */
export function themeFor(mode) {
	return MODES[mode] || MODES["minor"];
}

/** All mode keys. */
export function modeKeys() {
	return Object.keys(MODES);
}

/** True when the mode requires the Shabbos stillness freeze. */
export function modeFreezes(mode) {
	return !!themeFor(mode).freeze;
}

/**
 * Notice banner HTML for a holiday entry.
 * @param {object} entry Holiday entry from holidays.mjs (or erev variant).
 * @returns {string} HTML for the .yomtov-notice banner.
 */
export function noticeHtml(entry) {
	const t = themeFor(entry.mode);
	const title = entry.type === "erev"
		? `ערב ${t.he} · Erev ${t.en}`
		: `${entry.nameHe} · ${entry.nameEn}`;
	const sub = entry.type === "erev"
		? "The festival approaches — prepare with joy."
		: t.line;
	return `<span class="yomtov-emoji" aria-hidden="true">${t.emoji}</span> ` +
		`<strong class="yomtov-title">${escapeHtml(title)}</strong><br>` +
		`<span class="yomtov-line">${escapeHtml(sub)}</span>`;
}

function escapeHtml(s) {
	return String(s).replace(/[&<>"']/g, (ch) => ({
		"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
	}[ch]));
}
