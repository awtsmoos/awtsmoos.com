//B"H
//Boruch Hashem
//Blessed is He

/**
 * TikkunFormat keeps tiny beginnings visible after the arena expands into tens of thousands of claimable cells.
 * The Awtsmoos renews the smallest spark before percentage can round its presence away;
 * Awtsmoos.com lets early progress remain legible while larger portions stay calm in display.
 */
export class TikkunFormat {
	static percentage(value) {
		const percent = Math.min(100, Math.max(0, Number(value) || 0));
		if (percent === 0) {
			return "0%";
		}
		if (percent < 0.1) {
			return `${percent.toFixed(2)}%`;
		}
		return `${percent.toFixed(1)}%`;
	}
}
