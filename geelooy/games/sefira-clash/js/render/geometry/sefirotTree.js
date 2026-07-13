//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the sefirot tree vessel in this instant, revealing
 * its focused js render geometry service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H — The Etz Chaim layout is a quiet scaffold behind the battle.
 * It is not a picture imported from elsewhere; it is geometry made fresh,
 * a parchment whisper of sefiros whose circles and paths are reborn every draw.
 */
export function treeNodes(cx, cy, scale) {
	const p = (id, x, y) => ({ id, x: cx + x * scale, y: cy + y * scale });
	return [
		p('Keter', 0, -2.4),
		p('Chochmah', -1, -1.55),
		p('Binah', 1, -1.55),
		p('Daas', 0, -0.9),
		p('Chesed', -1.15, -0.25),
		p('Gevurah', 1.15, -0.25),
		p('Tiferes', 0, 0.35),
		p('Netzach', -1, 1.15),
		p('Hod', 1, 1.15),
		p('Yesod', 0, 1.85),
		p('Malchus', 0, 2.62)
	];
}

export const TREE_PATHS = [
	['Keter', 'Chochmah'],
	['Keter', 'Binah'],
	['Chochmah', 'Binah'],
	['Chochmah', 'Chesed'],
	['Binah', 'Gevurah'],
	['Chesed', 'Gevurah'],
	['Chesed', 'Tiferes'],
	['Gevurah', 'Tiferes'],
	['Tiferes', 'Netzach'],
	['Tiferes', 'Hod'],
	['Netzach', 'Hod'],
	['Netzach', 'Yesod'],
	['Hod', 'Yesod'],
	['Yesod', 'Malchus'],
	['Keter', 'Tiferes'],
	['Tiferes', 'Yesod']
];
