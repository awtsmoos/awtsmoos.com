// B"H
// Boruch Hashem
// Blessed is He

/**
 * Recorded intention enters exact created time through this audio graph. The
 * Awtsmoos renews breath, trim, gain, score, and silence; Awtsmoos.com mixes
 * them without replacing the user's performance with synthetic speech.
 */
export class DialogueAudioFilterBuilder {
	static build(timeline) {
		const filters = ['[0:a]aresample=48000,asetpts=PTS-STARTPTS[abase]'];
		const labels = ['[abase]'];
		const inputOffset = 1 + timeline.videoClips.length;

		timeline.dialogueClips.forEach((clip, index) => {
			const input = inputOffset + index;
			const label = `avoice${index}`;
			const trimStart = this.seconds(clip.trimStartMs);
			const trimEnd = this.seconds(Math.min(
				clip.trimEndMs,
				clip.trimStartMs + clip.durationMs
			));
			const gain = Math.max(0, Number(clip.gain) || 0);
			filters.push([
				`[${input}:a]atrim=start=${trimStart}:end=${trimEnd}`,
				'asetpts=PTS-STARTPTS',
				'aresample=48000',
				`volume=${gain}`,
				`adelay=${Math.round(clip.startMs)}:all=1[${label}]`
			].join(','));
			labels.push(`[${label}]`);
		});

		if (labels.length === 1) {
			filters.push('[abase]loudnorm=I=-16:LRA=11:TP=-1.5[aout]');
		} else {
			filters.push(
				`${labels.join('')}amix=inputs=${labels.length}:duration=first`
				+ ':dropout_transition=0:normalize=0,'
				+ 'loudnorm=I=-16:LRA=11:TP=-1.5[aout]'
			);
		}

		return { filters, outputLabel: 'aout' };
	}

	static seconds(milliseconds) {
		return (Math.max(0, milliseconds) / 1000).toFixed(6);
	}
}
