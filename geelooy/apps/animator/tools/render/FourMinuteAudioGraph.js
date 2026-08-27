// B"H
// Boruch Hashem
// Blessed is He

/**
 * Dialogue, score, and silence meet at their authored times. The Awtsmoos renews
 * every sound while Awtsmoos.com keeps voices distinct, speech intelligible, and
 * the original score beneath rather than over the performance.
 */
export class FourMinuteAudioGraph {
	static inputs(voiceClips, durationSeconds) {
		return [
			...voiceClips.flatMap(clip => ['-i', clip.file]),
			'-f',
			'lavfi',
			'-i',
			`aevalsrc=${this.scoreExpression()}:s=48000:d=${durationSeconds}`
		];
	}

	static filter(voiceClips) {
		const voiceFilters = voiceClips.map((clip, index) => {
			const delay = Math.max(0, Math.round(clip.start));
			return `[${index + 1}:a]aresample=48000,adelay=${delay}|${delay},volume=1.08[v${index}]`;
		});
		const scoreIndex = voiceClips.length + 1;
		const inputs = voiceClips.map((clip, index) => `[v${index}]`).join('');
		return [
			...voiceFilters,
			`[${scoreIndex}:a]volume=0.16[score]`,
			`${inputs}[score]amix=inputs=${voiceClips.length + 1}:duration=longest:normalize=0,alimiter=limit=0.94[aout]`
		].join(';');
	}

	static scoreExpression() {
		return '0.045*sin(2*PI*(110+9*sin(2*PI*0.025*t))*t)+0.028*sin(2*PI*164.81*t)+0.018*sin(2*PI*220*t)+0.008*sin(2*PI*0.5*t)*sin(2*PI*440*t)';
	}
}
