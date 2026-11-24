//B"H
/**
 * The Awtsmoos measures a song in beats even when its pulse quickens or rests:
 * a project tempo map of {beat, bpm, beatsPerBar} points converts beat<->seconds
 * piecewise, so seeking, grids and MIDI stay truthful mid-map.
 */

const positive = (v, f) => Number.isFinite(Number(v)) && Number(v) > 0 ? Number(v) : f;
const nonneg = (v, f = 0) => Number.isFinite(Number(v)) && Number(v) >= 0 ? Number(v) : f;

/** One tempo point: from `beat` onward the pulse is `bpm` in `beatsPerBar` bars. */
export function createTempoPoint(input = {}) {
	return {
		beat: nonneg(input.beat),
		bpm: Math.max(20, Math.min(400, positive(input.bpm, 120))),
		beatsPerBar: Math.max(1, Math.min(16, Math.round(positive(input.beatsPerBar, 4))))
	};
}

/**
 * Canonical map: sorted by beat, deduped, always anchored at beat 0.
 * A constant-tempo v2 project migrates to a single point at its tempo.
 */
export function normalizeTempoMap(input, fallbackBpm = 120, fallbackBeatsPerBar = 4) {
	const points = Array.isArray(input) ? input.map(createTempoPoint).sort((a, b) => a.beat - b.beat) : [];
	const deduped = points.filter((point, i) => i === 0 || point.beat !== points[i - 1].beat);
	if (!deduped.length || deduped[0].beat !== 0)
		deduped.unshift(createTempoPoint({ beat: 0, bpm: fallbackBpm, beatsPerBar: fallbackBeatsPerBar }));
	else
		deduped[0] = createTempoPoint({ beat: 0, bpm: deduped[0].bpm ?? fallbackBpm, beatsPerBar: deduped[0].beatsPerBar });
	return deduped;
}

/** Segments with cumulative seconds at each point's beat. */
function segments(map) {
	const points = normalizeTempoMap(map);
	const out = [];
	let seconds = 0;
	for (let i = 0; i < points.length; i++) {
		if (i > 0) seconds += (points[i].beat - points[i - 1].beat) * 60 / points[i - 1].bpm;
		out.push({ ...points[i], seconds });
	}
	return out;
}

/** Exact beat -> seconds under the map (piecewise linear per segment). */
export function beatsToSeconds(map, beat) {
	const target = nonneg(beat);
	const segs = segments(map);
	let seg = segs[0];
	for (const candidate of segs) { if (candidate.beat <= target) seg = candidate; else break; }
	return seg.seconds + (target - seg.beat) * 60 / seg.bpm;
}

/** Exact seconds -> beats under the map; correct for seeks landing mid-map. */
export function secondsToBeats(map, seconds) {
	const target = nonneg(seconds);
	const segs = segments(map);
	let seg = segs[0];
	for (const candidate of segs) { if (candidate.seconds <= target) seg = candidate; else break; }
	return seg.beat + (target - seg.seconds) * seg.bpm / 60;
}

/** The tempo point in force at a beat (for grid, metronome and signatures). */
export function tempoPointAtBeat(map, beat) {
	const target = nonneg(beat);
	const points = normalizeTempoMap(map);
	let active = points[0];
	for (const point of points) { if (point.beat <= target) active = point; else break; }
	return active;
}
export function tempoPointAtSeconds(map, seconds) {
	return tempoPointAtBeat(map, secondsToBeats(map, seconds));
}

/** Bar length in beats at a beat, and the bar index containing it. */
export function barAtBeat(map, beat) {
	const point = tempoPointAtBeat(map, beat);
	return { beatsPerBar: point.beatsPerBar, bar: Math.floor(nonneg(beat) / point.beatsPerBar) };
}
