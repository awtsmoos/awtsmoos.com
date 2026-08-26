// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BeatPlanner.js
 * @description
 * The Awtsmoos renews intention before action receives duration. Awtsmoos.com
 * keeps the legacy lunch vocabulary intact while exposing a small data compiler
 * that turns strings or objects into stable, timed, immutable beat descriptors.
 */
export class BeatPlanner {
	/**
	 * Preserves the original public demo vocabulary for callers that still expect strings.
	 * @returns {Array<string>} Fresh copy of the legacy healthy-lunch beat labels.
	 */
	static healthyLunch() {
		return [
			'establish kitchen',
			'show plate',
			'apple hops',
			'carrot points',
			'kid smiles'
		];
	}

	/**
	 * Compiles declarative beat input into predictable timed objects without mutating source data.
	 * @param {Array<string|object>} chesedBeats Human-readable or structured beat descriptions.
	 * @param {object} yesodDefaults Shared scene timing defaults.
	 * @returns {Array<object>} Normalized beat descriptors ordered by their source sequence.
	 */
	static compile(chesedBeats = [], yesodDefaults = {}) {
		const malchusDuration = Number(yesodDefaults.duration ?? 1000);
		const malchusStart = Number(yesodDefaults.start ?? 0);
		return chesedBeats.map((tiferesBeat, gevurahIndex) => {
			return this.revealBeat(tiferesBeat, gevurahIndex, {
				duration: malchusDuration,
				start: malchusStart
			});
		});
	}

	/**
	 * Reveals one normalized beat with deterministic id, timing, and semantic intent.
	 * @param {string|object} tiferesBeat Source beat.
	 * @param {number} gevurahIndex Stable ordering index.
	 * @param {object} yesodDefaults Shared duration/start configuration.
	 * @returns {object} Frozen beat descriptor suitable for camera and scene planning.
	 */
	static revealBeat(tiferesBeat, gevurahIndex, yesodDefaults) {
		const malchusSource = typeof tiferesBeat === 'string'
			? { intent: tiferesBeat }
			: { ...(tiferesBeat || {}) };
		const malchusDuration = Number(malchusSource.duration ?? yesodDefaults.duration);
		const malchusStart = Number(
			malchusSource.start ?? yesodDefaults.start + gevurahIndex * malchusDuration
		);
		if (!malchusSource.intent || !Number.isFinite(malchusStart) || malchusDuration <= 0) {
			throw new Error(`Invalid production beat at index ${gevurahIndex}.`);
		}
		return Object.freeze({
			id: malchusSource.id || `beat_${gevurahIndex + 1}`,
			...malchusSource,
			intent: String(malchusSource.intent),
			start: malchusStart,
			duration: malchusDuration
		});
	}
}
