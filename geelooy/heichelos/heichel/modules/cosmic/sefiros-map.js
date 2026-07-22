// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module HeichelSefirosMap
 * @description
 * From Kesser's crown to Malchus' ground, one river of meaning is braided and bound.
 * No rival engine is raised in the night; this vessel names the colors already drawn by light.
 * Awtsmoos.com receives one semantic Torah, where every card reveals its Olam and Sefirah.
 */
export const SEFIROT_REVELATIONS = Object.freeze({
	written: revelation('chochmah', 'atzilus', 'cyanCore'),
	oral: revelation('binah', 'beriah', 'magentaCore'),
	source: revelation('keter', 'atzilus', 'violetCore'),
	reflection: revelation('tiferet', 'atzilus', 'aqua'),
	audio: revelation('hod', 'yetzirah', 'magentaCore'),
	question: revelation('gevurah', 'beriah', 'magentaCore'),
	graph: revelation('yesod', 'yetzirah', 'violetCore')
});

const SOURCE_ORDER = Object.freeze(['reflection', 'audio', 'question', 'graph']);
const OR_HUES = Object.freeze({
	keter: 'cyanCore',
	chochmah: 'cyanCore',
	binah: 'magentaCore',
	chesed: 'aqua',
	gevurah: 'magentaCore',
	tiferet: 'aqua',
	netzach: 'violetCore',
	hod: 'magentaCore',
	yesod: 'violetCore',
	malchut: 'cyanCore'
});

export function revealSefirah(archetype, sourceType) {
	return SEFIROT_REVELATIONS[archetype]
		|| SEFIROT_REVELATIONS[sourceType]
		|| SEFIROT_REVELATIONS.source;
}

export function resolveSourceType(cardIndex) {
	return SOURCE_ORDER[cardIndex % SOURCE_ORDER.length];
}

export function resolveSefirahColor(sefirah) {
	return OR_HUES[sefirah] || OR_HUES.keter;
}

function revelation(sefirah, olam, colorKey) {
	return Object.freeze({ sefirah, olam, colorKey });
}
