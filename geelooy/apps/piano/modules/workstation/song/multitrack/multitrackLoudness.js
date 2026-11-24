//B"H
/** The Awtsmoos is measured honestly: estimates are named estimates, never certificates. */

/** 4x cubic-interpolated true-peak estimate in dBTP (an estimate, not a certified meter). */
export function estimateTruePeakDb(channels) {
	let peak = 0;
	for (const data of channels) {
		for (let i = 0; i < data.length; i++) {
			peak = Math.max(peak, Math.abs(data[i] || 0));
			const a = data[i - 1] || 0, b = data[i] || 0, c = data[i + 1] || 0, d = data[i + 2] || 0;
			for (const t of [.25, .5, .75]) {
				const v = .5 * ((2 * b) + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (-a + 3 * b - 3 * c + d) * t * t * t);
				peak = Math.max(peak, Math.abs(v));
			}
		}
	}
	return peak > 0 ? 20 * Math.log10(peak) : -Infinity;
}

/** One RBJ stage used by the K-weighting approximation below. */
function stage(type, frequency, gainDb, q, sampleRate) {
	const w = 2 * Math.PI * frequency / sampleRate, cos = Math.cos(w), sin = Math.sin(w);
	const alpha = sin / (2 * q), a = 10 ** (gainDb / 40);
	if (type === 'highpass') return { b: [(1 + cos) / 2, -(1 + cos), (1 + cos) / 2], d: [1 + alpha, -2 * cos, 1 - alpha] };
	const s = 2 * Math.sqrt(a) * alpha;
	return { b: [a * ((a + 1) + (a - 1) * cos + s), -2 * a * ((a - 1) + (a + 1) * cos), a * ((a + 1) + (a - 1) * cos - s)], d: [(a + 1) - (a - 1) * cos + s, 2 * ((a - 1) - (a + 1) * cos), (a + 1) - (a - 1) * cos - s] };
}

/** K-weighting pre-filter (shelf + high-pass, BS.1770 frequencies via RBJ; estimate). */
export function kWeightingStages(sampleRate) {
	return [stage('highshelf', 1681.974450955533, 3.999843853973347, .7071752369554196, sampleRate),
		stage('highpass', 38.13547087602444, 0, .5003270373238773, sampleRate)];
}

function filteredEnergy(data, stages) {
	let sum = 0;
	const state = stages.map(() => ({ x1: 0, x2: 0, y1: 0, y2: 0 }));
	for (let i = 0; i < data.length; i++) {
		let v = data[i];
		stages.forEach(({ b, d }, k) => {
			const s = state[k];
			const y = (b[0] * v + b[1] * s.x1 + b[2] * s.x2 - d[1] * s.y1 - d[2] * s.y2) / d[0];
			s.x2 = s.x1; s.x1 = v; s.y2 = s.y1; s.y1 = y; v = y;
		});
		sum += v * v;
	}
	return sum;
}

/**
 * Integrated loudness estimate in LUFS: K-weighted, absolute gate -70 LUFS and
 * relative gate -10 LU over 400 ms blocks. Labeled an estimate; not a
 * certified BS.1770 meter. Silence returns -Infinity.
 */
export function integratedLoudnessEstimate(channels, sampleRate) {
	const stages = kWeightingStages(sampleRate);
	const block = Math.max(1, Math.round(sampleRate * .4));
	const energies = [];
	const total = channels[0]?.length || 0;
	for (let start = 0; start + block <= total; start += block) {
		let mean = 0;
		for (const data of channels) mean += filteredEnergy(data.subarray(start, start + block), stages) / block;
		energies.push(mean);
	}
	if (!energies.length) return -Infinity;
	const loud = (list) => -0.691 + 10 * Math.log10(Math.max(1e-12, list.reduce((a, b) => a + b, 0) / list.length));
	const absolute = energies.filter((e) => -0.691 + 10 * Math.log10(Math.max(1e-12, e)) > -70);
	if (!absolute.length) return -Infinity;
	const first = loud(absolute);
	const gated = absolute.filter((e) => -0.691 + 10 * Math.log10(Math.max(1e-12, e)) > first - 10);
	return gated.length ? loud(gated) : first;
}

/** Combined master statistics for a rendered buffer-like {numberOfChannels,getChannelData}. */
export function measureMasterStats(buffer) {
	const channels = [];
	for (let c = 0; c < buffer.numberOfChannels; c++) channels.push(buffer.getChannelData(c));
	return {
		truePeakDb: estimateTruePeakDb(channels),
		integratedLufs: integratedLoudnessEstimate(channels, buffer.sampleRate || 44100)
	};
}
