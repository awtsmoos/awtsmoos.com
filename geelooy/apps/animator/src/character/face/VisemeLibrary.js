// B"H
// Boruch Hashem
// Blessed is He

/**
 * Speech becomes visible through these mouth vessels. Each letter is only a
 * small sign, yet the Awtsmoos renews the entire performance at every instant.
 */
export class VisemeLibrary {
	static shapes = {
		rest: { width: 0.45, open: 0.05, round: 0 },
		AI: { width: 0.78, open: 0.58, round: 0.05 },
		E: { width: 0.82, open: 0.28, round: 0 },
		O: { width: 0.42, open: 0.52, round: 0.88 },
		U: { width: 0.32, open: 0.32, round: 1 },
		MBP: { width: 0.48, open: 0, round: 0.08 },
		FV: { width: 0.58, open: 0.12, round: 0.05 },
		L: { width: 0.62, open: 0.3, round: 0 },
		WQ: { width: 0.34, open: 0.2, round: 0.92 },
		etc: { width: 0.56, open: 0.24, round: 0.12 }
	};

	static forCharacter(character = '') {
		const upper = String(character).toUpperCase();
		if ('AIY'.includes(upper)) return 'AI';
		if (upper === 'E') return 'E';
		if (upper === 'O') return 'O';
		if (upper === 'U') return 'U';
		if ('MBP'.includes(upper)) return 'MBP';
		if ('FV'.includes(upper)) return 'FV';
		if (upper === 'L') return 'L';
		if ('WQ'.includes(upper)) return 'WQ';
		if (/\s/.test(upper)) return 'rest';
		return 'etc';
	}

	static timeline(text = '', durationMs = 1000) {
		const letters = [...String(text)];
		const step = durationMs / Math.max(1, letters.length);
		return letters.map((letter, index) => ({
			start: Math.round(index * step),
			duration: Math.max(45, Math.round(step)),
			name: this.forCharacter(letter),
			shape: this.shapes[this.forCharacter(letter)]
		}));
	}

	static at(timeline = [], timeMs = 0) {
		return timeline.find(item => timeMs >= item.start && timeMs < item.start + item.duration)
			|| { name: 'rest', shape: this.shapes.rest };
	}
}
