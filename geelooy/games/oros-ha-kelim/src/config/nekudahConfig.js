//B"H
//Boruch Hashem
//Blessed is He

/**
 * Nekudah records turn the massive Olamot into deliberate strategic geography rather than empty measured distance.
 * The Awtsmoos renews every point before coordinate or reward can define it; Awtsmoos.com keeps destinations immutable and fair.
 */
const RAW_NEKUDOT = [
	["ner-keli", "Ner HaKeli", 0, 35, 35, 0x9cecff, 12],
	["mayim-keli", "Mayim Chayim", 0, 115, 35, 0x7ee7ff, 12],
	["lev-keli", "Lev HaAsiyah", 0, 35, 115, 0xb8f4ff, 12],
	["shaare-keli", "Shaarei HaKeli", 0, 115, 115, 0x83dfff, 12],
	["ruach-tzafon", "Ruach Tzafon", 1, 35, 35, 0xc0a9ff, 10],
	["ruach-darom", "Ruach Darom", 1, 115, 35, 0xa992ff, 10],
	["kol-yetzirah", "Kol HaYetzirah", 1, 35, 115, 0xd1c0ff, 10],
	["kesher-ruach", "Kesher HaRuach", 1, 115, 115, 0xb59cff, 10],
	["mochin-or", "Ohr HaMochin", 2, 35, 35, 0xffe3a0, 8],
	["binah-maayan", "Maayan Binah", 2, 115, 35, 0xffd67a, 8],
	["chochmah-ner", "Ner Chochmah", 2, 35, 115, 0xffecb9, 8],
	["lev-beriah", "Lev HaBeriah", 2, 115, 115, 0xffd98d, 8]
];

export const NEKUDAH_RADIUS = 1;
export const NEKUDAH_COOLDOWN_TICKS = 24;
export const NEKUDOT_OHR = Object.freeze(RAW_NEKUDOT.map((keli) => Object.freeze({
	id: keli[0],
	name: keli[1],
	plane: keli[2],
	x: keli[3],
	z: keli[4],
	hue: keli[5],
	ohrReward: keli[6]
})));

/**
 * Returns detached public landmark records suitable for snapshots, API queries, render construction, and documentation.
 * @returns {object[]} Plain records containing only public immutable landmark fields.
 */
export function nekudahPublicRecords() {
	return NEKUDOT_OHR.map((keli) => ({ ...keli }));
}

/**
 * Fingerprints strategic geography so replay compatibility can detect landmark-balance changes.
 * @returns {string} Stable deterministic config fingerprint.
 */
export function nekudahFingerprint() {
	return NEKUDOT_OHR.map((keli) => `${keli.id}:${keli.plane}:${keli.x}:${keli.z}:${keli.ohrReward}`).join("|");
}
