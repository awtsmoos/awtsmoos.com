//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file The four levels of the Beis Hamikdash Information Architecture.
 * @description Hashem gave the proportions: Shaar (gateway), Azarah (courtyard),
 * Heichal (sanctuary), Kodesh HaKodashim (holy of holies). Each level is a
 * contract: what the visitor may do there, how much chrome surrounds the
 * content, and how the visual language shifts as one ascends.
 *
 * Ascent rule: going deeper = going holier = less distraction, more focus.
 */

/**
 * Level 1 — SHAAR (Gateway).
 * The entrance to the Mikdash. Welcoming, bright, clear.
 * Directs inward; never holds the visitor.
 */
export const SHAAR = {
	id: "shaar",
	level: 1,
	name: "Shaar",
	nameHe: "שער",
	english: "Gateway",
	/** What the visitor does here. */
	purpose: "Arrive, orient, choose a direction inward.",
	/** Visual contract. */
	visual: {
		mood: "welcoming",
		brightness: "bright",
		chrome: "full", // header, nav, hero, footer all present
		contentDensity: "low",
		typography: "large display type, generous whitespace",
		color: "warm light, open sky tones",
	},
	/** Hard rules for this level. */
	rules: [
		"Every page must offer at least one clear path inward (to Azarah).",
		"No deep content lives here — only orientation.",
		"Load fast; the gate must never feel heavy.",
	],
};

/**
 * Level 2 — AZARAH (Courtyard).
 * Open, public. Many doors visible. Browse by topic, series, parsha.
 */
export const AZARAH = {
	id: "azarah",
	level: 2,
	name: "Azarah",
	nameHe: "עזרה",
	english: "Courtyard",
	purpose: "Browse, search, compare. See many doors at once.",
	visual: {
		mood: "open",
		brightness: "bright",
		chrome: "full",
		contentDensity: "medium",
		typography: "scannable cards, clear hierarchy",
		color: "warm light, stone tones",
	},
	rules: [
		"Every item must show where it leads (its Heichal destination).",
		"Filtering and search must be visible, not hidden.",
		"No item may require more than two taps to open.",
	],
};

/**
 * Level 3 — HEICHAL (Sanctuary).
 * The teaching itself. Focused reading. The menorah light is here:
 * warm paper, clear text, nothing competing with the words.
 */
export const HEICHAL = {
	id: "heichal",
	level: 3,
	name: "Heichal",
	nameHe: "היכל",
	english: "Sanctuary",
	purpose: "Read, learn, absorb. One teaching at a time.",
	visual: {
		mood: "focused",
		brightness: "warm",
		chrome: "reduced", // minimal header, no sidebar, no related-posts noise
		contentDensity: "high",
		typography: "sefer reader: 4x body, English under Hebrew, phrase rule",
		color: "warm paper (#f7f1e3 range), dark ink (#2b2118)",
	},
	rules: [
		"One teaching per page. Never two teachings side by side.",
		"English below Hebrew, never side by side.",
		"Reader controls (Both/Hebrew/English, theme, size) always available.",
		"No autoplay, no popups, no interstitial ads — ever.",
	],
};

/**
 * Level 4 — KODESH_HAKODASHIM (Holy of Holies).
 * The deepest teachings. Entered once a year by the Kohen Gadol alone —
 * here: entered with kavanah (intention), alone with the text.
 * Minimal UI, maximum content, zero distraction.
 */
export const KODESH_HAKODASHIM = {
	id: "kodesh",
	level: 4,
	name: "Kodesh HaKodashim",
	nameHe: "קודש הקודשים",
	english: "Holy of Holies",
	purpose: "Encounter the deepest truths. Nothing between reader and text.",
	visual: {
		mood: "sacred",
		brightness: "candle-warm, slightly dimmed chrome",
		chrome: "none", // no header nav, no footer, no sidebar, no comments
		contentDensity: "maximum",
		typography: "larger than Heichal, narrower measure, slower rhythm",
		color: "deep warm paper, near-black ink, gold accents only",
	},
	rules: [
		"Entry requires kavanah: a quiet interstitial gate, one breath, one tap.",
		"No comments, no likes, no share buttons, no related posts.",
		"No navigation chrome except a single quiet 'return' path.",
		"Nothing may autoplay, animate, or demand attention except the text.",
		"The gate is passed once per teaching per session — never nag.",
	],
};

/** All levels in ascent order. */
export const LEVELS = [SHAAR, AZARAH, HEICHAL, KODESH_HAKODASHIM];

/** Look up a level by id. */
export function getLevel(id) {
	const found = LEVELS.find((l) => l.id === id);
	if (!found) throw new Error(`Unknown Mikdash level '${id}'`);
	return found;
}

/** Look up a level by number (1-4). */
export function getLevelByNumber(n) {
	const found = LEVELS.find((l) => l.level === n);
	if (!found) throw new Error(`Unknown Mikdash level number '${n}'`);
	return found;
}

/**
 * Ascent check: is `to` deeper (holier) than `from`?
 * Moving deeper should feel like ascending — the UI sheds chrome.
 */
export function isAscent(fromId, toId) {
	return getLevel(toId).level > getLevel(fromId).level;
}

/**
 * Chrome budget per level: maximum UI elements allowed around content.
 * Lower = holier.
 */
export function chromeBudget(levelId) {
	const budgets = { shaar: 10, azarah: 8, heichal: 3, kodesh: 1 };
	const b = budgets[levelId];
	if (b === undefined) throw new Error(`Unknown Mikdash level '${levelId}'`);
	return b;
}
