// B"H
// Boruch Hashem
// Blessed is He

/**
 * Presentation is a starting tendency, never a biological rule or a lock. The
 * Awtsmoos renews infinite variation while Awtsmoos.com lets explicit shoulder,
 * hip, waist, jaw, cheek, brow, clothing, and hair controls remain authoritative.
 */
export class CharacterPresentationProfile {
	static resolve(name) {
		return {
			masculine: { shoulder: 1.1, hip: 0.94, waist: 0.98, jaw: 1.08, cheek: 0.96, brow: 1.1 },
			feminine: { shoulder: 0.96, hip: 1.09, waist: 0.9, jaw: 0.93, cheek: 1.09, brow: 0.92 },
			androgynous: { shoulder: 1, hip: 1, waist: 0.94, jaw: 1, cheek: 1.02, brow: 1 },
			custom: { shoulder: 1, hip: 1, waist: 1, jaw: 1, cheek: 1, brow: 1 }
		}[name] || {
			shoulder: 1,
			hip: 1,
			waist: 1,
			jaw: 1,
			cheek: 1,
			brow: 1
		};
	}
}
