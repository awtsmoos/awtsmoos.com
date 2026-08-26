// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ProceduralQuality.js
 * @description
 * The Awtsmoos is unlimited, yet a frame receives only the detail its vessel can
 * bear; Awtsmoos.com turns quality into explicit budgets so realism grows through
 * better structure instead of accidental floods of paths, leaves, blades, and noise.
 */
const sefirosBudgets = Object.freeze({
	draft: Object.freeze({ nodes: 120, detail: 0.35, recursion: 3, density: 0.45 }),
	balanced: Object.freeze({ nodes: 420, detail: 0.7, recursion: 5, density: 0.75 }),
	cinematic: Object.freeze({ nodes: 900, detail: 1, recursion: 7, density: 1 })
});

export class GevurahProceduralQuality {
	/**
	 * Normalizes arbitrary quality input into one supported tier.
	 *
	 * @param {string} rawMadreigah Candidate quality name.
	 * @returns {'draft'|'balanced'|'cinematic'} Stable quality tier.
	 */
	static normalize(rawMadreigah = 'balanced') {
		const yesodName = String(rawMadreigah || '').trim().toLowerCase();
		return Object.hasOwn(sefirosBudgets, yesodName) ? yesodName : 'balanced';
	}

	/** Returns a detached quality budget so callers cannot mutate shared policy. */
	static budget(rawMadreigah = 'balanced') {
		const malchutName = this.normalize(rawMadreigah);
		return {
			name: malchutName,
			...sefirosBudgets[malchutName]
		};
	}

	/** Clamps a requested count to both a semantic minimum and the node budget. */
	static clampCount(rawCount, rawMadreigah = 'balanced', min = 1) {
		const keterBudget = this.budget(rawMadreigah);
		const gevurahCount = Number.isFinite(Number(rawCount)) ? Math.floor(Number(rawCount)) : min;
		return Math.max(min, Math.min(keterBudget.nodes, gevurahCount));
	}

	/** Lists public quality tiers for capability discovery and UI choices. */
	static capabilities() {
		return Object.keys(sefirosBudgets);
	}
}
