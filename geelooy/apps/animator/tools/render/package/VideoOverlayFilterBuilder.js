// B"H
// Boruch Hashem
// Blessed is He

/**
 * Imported footage receives the same cover-fit and center-origin garment used
 * by browser preview. The Awtsmoos renews every transformed frame, while this
 * builder gives Awtsmoos.com one deterministic FFmpeg visual covenant.
 */
export class VideoOverlayFilterBuilder {
	static blendModes = new Map([
		['multiply', { mode: 'multiply', neutral: 'white' }],
		['overlay', { mode: 'overlay', neutral: 'gray' }],
		['screen', { mode: 'screen', neutral: 'black' }]
	]);

	static build(timeline) {
		const filters = ['[0:v]setpts=PTS-STARTPTS[vbase0]'];
		let baseLabel = 'vbase0';

		timeline.videoClips.forEach((clip, index) => {
			const sourceLabel = `vsource${index}`;
			const outputLabel = `vbase${index + 1}`;
			filters.push(this.sourceFilter(clip, index, timeline, sourceLabel));

			const blend = this.blendModes.get(clip.blendMode);
			if (blend) {
				filters.push(...this.blendFilters(
					clip,
					index,
					timeline,
					sourceLabel,
					baseLabel,
					outputLabel,
					blend
				));
			} else {
				filters.push(this.overlayFilter(
					clip,
					index,
					sourceLabel,
					baseLabel,
					outputLabel
				));
			}

			baseLabel = outputLabel;
		});

		return { filters, outputLabel: baseLabel };
	}

	static sourceFilter(clip, index, timeline, sourceLabel) {
		const duration = this.seconds(clip.durationMs);
		const scale = Math.max(0.05, Number(clip.scale) || 1);
		const rotation = Number(clip.rotation) * Math.PI / 180;
		const width = timeline.settings.width;
		const height = timeline.settings.height;
		return [
			`[${index + 1}:v]trim=duration=${duration}`,
			'setpts=PTS-STARTPTS',
			`scale=${width}:${height}:force_original_aspect_ratio=increase`,
			`crop=${width}:${height}`,
			`scale=trunc(iw*${scale}/2)*2:trunc(ih*${scale}/2)*2`,
			`rotate=${rotation}:ow=rotw(iw):oh=roth(ih):c=black@0`,
			'format=rgba',
			`colorchannelmixer=aa=${this.clamp(clip.opacity)}[${sourceLabel}]`
		].join(',');
	}

	static overlayFilter(clip, index, sourceLabel, baseLabel, outputLabel) {
		const timedLabel = `vtimed${index}`;
		const start = this.seconds(clip.startMs);
		return [
			`[${sourceLabel}]setpts=PTS+${start}/TB[${timedLabel}]`,
			`[${baseLabel}][${timedLabel}]overlay=x=(W-w)/2+${clip.x}:y=(H-h)/2+${clip.y}`
				+ `:eof_action=pass:shortest=0[${outputLabel}]`
		].join(';');
	}

	static blendFilters(clip, index, timeline, sourceLabel, baseLabel, outputLabel, blend) {
		const duration = this.seconds(clip.durationMs);
		const start = this.seconds(clip.startMs);
		const end = this.seconds(clip.startMs + clip.durationMs);
		const canvasLabel = `vcanvas${index}`;
		const localPlateLabel = `vlocalplate${index}`;
		const timedPlateLabel = `vtimedplate${index}`;
		return [
			`color=c=${blend.neutral}:s=${timeline.settings.width}x${timeline.settings.height}:d=${duration}[${canvasLabel}]`,
			`[${canvasLabel}][${sourceLabel}]overlay=x=(W-w)/2+${clip.x}:y=(H-h)/2+${clip.y}`
				+ `:shortest=1[${localPlateLabel}]`,
			`[${localPlateLabel}]setpts=PTS+${start}/TB[${timedPlateLabel}]`,
			`[${baseLabel}][${timedPlateLabel}]blend=all_mode=${blend.mode}`
				+ `:all_opacity=${this.clamp(clip.opacity)}:enable='between(t,${start},${end})'[${outputLabel}]`
		];
	}

	static seconds(milliseconds) {
		return (Math.max(0, milliseconds) / 1000).toFixed(6);
	}

	static clamp(value) {
		return Math.max(0, Math.min(1, Number(value) || 0));
	}
}
