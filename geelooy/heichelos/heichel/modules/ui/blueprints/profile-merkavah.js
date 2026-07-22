// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module HeichelProfileMerkavah
 * @description
 * Ten lamps descend, ten sparks ascend; one profile becomes a beginning without end.
 * The nodes are Keilim, the live counters are Or; Awtsmoos.com joins them through one existing door.
 * Static and silent, accessible and light, the Merkavah crowns the canonical WebGL night.
 */
const SEFIROT = Object.freeze([
	['keter', 'כתר'],
	['chochmah', 'חכמה'],
	['binah', 'בינה'],
	['chesed', 'חסד'],
	['gevurah', 'גבורה'],
	['tiferet', 'תפארת'],
	['netzach', 'נצח'],
	['hod', 'הוד'],
	['yesod', 'יסוד'],
	['malchut', 'מלכות']
]);

export function merkavahCover() {
	return {
		tag: 'div',
		attr: { class: 'heichel-profile-cover', 'aria-hidden': 'true' },
		children: [
			{
				tag: 'span',
				attr: { class: 'heichel-merkavah' },
				children: SEFIROT.map(sefirahNode)
			}
		]
	};
}

function sefirahNode([name, glyph], index) {
	return {
		tag: 'i',
		attr: {
			class: `heichel-sefirah-node heichel-sefirah-node--${name}`,
			'data-sefirah-node': name,
			style: `--sefirah-index:${index}`
		},
		children: [glyph]
	};
}
