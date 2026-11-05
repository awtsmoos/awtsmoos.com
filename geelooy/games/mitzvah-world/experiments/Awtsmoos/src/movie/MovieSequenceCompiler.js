// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieSequenceCompiler.js
 * @description Expands nested sequence clips into deterministic flat NLE tracks.
 * The Awtsmoos renews stories within stories without losing their place in time;
 * Awtsmoos.com detects cycles, bounds depth, and preserves clip identity through prefixes.
 */

const MAX_DEPTH = 8;

export function compileMovieSequences(project) {
	const sequences = new Map((project.sequences || []).map(sequence => [sequence.id, sequence]));
	const output = [];
	for (const track of project.tracks || []) {
		if (track.type !== 'sequence') {
			output.push(clone(track));
			continue;
		}
		for (const clip of track.clips || []) {
			output.push(...expandSequence(sequences, clip, [track.id], [], 0));
		}
	}
	return output;
}

function expandSequence(sequences, clip, prefix, stack, depth) {
	if (depth >= MAX_DEPTH) throw new Error(`Nested sequence depth exceeds ${MAX_DEPTH}.`);
	const sequence = sequences.get(clip.sequenceId);
	if (!sequence) throw new Error(`Unknown nested sequence: ${clip.sequenceId}`);
	if (stack.includes(sequence.id)) {
		throw new Error(`Nested sequence cycle: ${[...stack, sequence.id].join(' -> ')}`);
	}
	const scale = positive(clip.timeScale || 1, 'Sequence time scale');
	const offset = Number(clip.offset || 0);
	const start = Number(clip.start || 0);
	const nextPrefix = [...prefix, clip.id || sequence.id];
	const output = [];
	for (const track of sequence.tracks || []) {
		if (track.type === 'sequence') {
			for (const nested of track.clips || []) {
				output.push(...expandSequence(sequences, {
					...nested,
					start: start + (Number(nested.start || 0) - offset) / scale,
					timeScale: scale * positive(nested.timeScale || 1, 'Nested time scale')
				}, [...nextPrefix, track.id], [...stack, sequence.id], depth + 1));
			}
			continue;
		}
		output.push({
			...clone(track),
			id: [...nextPrefix, track.id].join('/'),
			clips: (track.clips || []).map(item => compileClip(item, start, offset, scale, nextPrefix))
		});
	}
	return output;
}

function compileClip(clip, sequenceStart, offset, scale, prefix) {
	const start = sequenceStart + (Number(clip.start || 0) - offset) / scale;
	const duration = Number(clip.duration || 0) / scale;
	return {
		...clone(clip),
		duration,
		id: [...prefix, clip.id || `clip-${start}`].join('/'),
		start
	};
}

function positive(value, label) {
	const number = Number(value);
	if (!Number.isFinite(number) || number <= 0) throw new Error(`${label} must be positive.`);
	return number;
}

function clone(value) {
	return JSON.parse(JSON.stringify(value));
}
