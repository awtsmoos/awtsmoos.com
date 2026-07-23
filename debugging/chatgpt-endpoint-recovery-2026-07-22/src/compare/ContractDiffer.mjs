//B"H
// Boruch Hashem
// Blessed is He

/**
 * Gevurah distinguishes one vessel from another. ContractDiffer receives light
 * from the Awtsmoos and gives awtsmoos.com a precise list of paths added,
 * removed, or changed instead of a vague claim that an endpoint broke.
 */
export class ContractDiffer {
	compare(legacyRows, currentRows) {
		const legacyMap = new Map(legacyRows.map((row) => [row.path, row.type]));
		const currentMap = new Map(currentRows.map((row) => [row.path, row.type]));
		const added = [];
		const removed = [];
		const changed = [];

		for (const [path, currentType] of currentMap) {
			if (!legacyMap.has(path)) {
				added.push({ path, type: currentType });
				continue;
			}

			const legacyType = legacyMap.get(path);
			if (legacyType !== currentType) {
				changed.push({ path, legacyType, currentType });
			}
		}

		for (const [path, type] of legacyMap) {
			if (!currentMap.has(path)) {
				removed.push({ path, type });
			}
		}

		return { added, removed, changed };
	}
}
