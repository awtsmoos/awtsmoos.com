// B"H
// Boruch Hashem
// Blessed is He

/**
 * Acting is a chord: gaze, breath, locomotion, emotion, and contact can coexist.
 * The Awtsmoos renews their union while Awtsmoos.com blends each channel by its
 * own nature instead of allowing one timeline clip to erase the entire person.
 */
export class PerformanceChannelBlender {
	static blend(entries) {
		const state = { activePerformanceIds: [] };
		const categorical = new Map();
		const gaze = [];
		const emotions = [];
		for (const entry of entries) {
			const weight = this.weight(entry);
			state.activePerformanceIds.push(entry.performance.id);
			for (const [key, value] of Object.entries(entry.performance.payload || {})) {
				if (key === 'gaze' && Array.isArray(value)) {
					gaze.push({ value, weight });
					continue;
				}
				if (key === 'emotion' || key === 'emotionBlend') {
					emotions.push({ value, weight });
					continue;
				}
				if (typeof value === 'number') {
					state[key] = Number(state[key] || 0) + value * weight;
					continue;
				}
				if (typeof value === 'boolean') {
					state[key] = Boolean(state[key] || value);
					continue;
				}
				const current = categorical.get(key);
				if (!current || weight >= current.weight) {
					categorical.set(key, { value, weight });
				}
			}
		}
		for (const [key, entry] of categorical.entries()) {
			state[key] = entry.value;
		}
		if (gaze.length) state.gaze = this.vector(gaze);
		if (emotions.length) {
			const strongest = [...emotions].sort((a, b) => b.weight - a.weight)[0];
			state.emotion = strongest.value;
			state.emotionIntensity = Math.min(1.6, emotions.reduce((sum, item) => sum + item.weight, 0));
		}
		return state;
	}

	static weight(entry) {
		const performance = entry.performance;
		const progress = Math.max(0, Math.min(1, entry.localTime / Math.max(1, performance.duration)));
		const fade = Math.min(1, progress / 0.12, (1 - progress) / 0.12);
		const intensity = Number(performance.payload?.intensity ?? 1);
		return Math.max(0.08, fade) * intensity;
	}

	static vector(entries) {
		const total = entries.reduce((sum, entry) => sum + entry.weight, 0) || 1;
		return [0, 1].map((index) => {
			return entries.reduce((sum, entry) => {
				return sum + Number(entry.value[index] || 0) * entry.weight;
			}, 0) / total;
		});
	}
}
