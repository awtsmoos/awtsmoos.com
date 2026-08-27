// B"H
// Boruch Hashem
// Blessed is He

/**
 * The selected dialogue clip becomes a small recording booth. The human voice
 * may replace guessed timing, while the Awtsmoos renews speaker and timeline in
 * one shared moment.
 */
export class DialogueRecorderPanel {
	static render(clip) {
		if (!clip || clip.type !== 'dialogue') return this.message('Select a dialogue clip to record its voice.');
		const status = clip.payload?.voiceStatus || 'empty';
		const duration = clip.payload?.audioDurationMs
			? `${(clip.payload.audioDurationMs / 1000).toFixed(2)}s recorded`
			: 'No recording yet';
		return {
			tag: 'section',
			attrs: { className: 'aw-nle-recorder' },
			style: { padding: '10px', borderRadius: '10px', background: 'rgba(15,23,42,.72)' },
			children: [
				{ tag: 'strong', text: 'Voice for this line' },
				{ tag: 'div', attrs: { className: 'aw-nle-field' }, text: clip.payload?.text || clip.name },
				{ tag: 'div', attrs: { className: 'aw-nle-field' }, text: `Status: ${status} • ${duration}` },
				this.buttons(status),
				clip.payload?.voiceError
					? { tag: 'div', attrs: { className: 'aw-nle-field' }, style: { color: '#ffb4b4' }, text: clip.payload.voiceError }
					: null
			].filter(Boolean)
		};
	}

	static buttons(status) {
		const recording = status === 'recording';
		const ready = status === 'ready';
		return {
			tag: 'div',
			style: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' },
			children: [
				this.button(recording ? 'Recording…' : ready ? 'Replace' : 'Record', 'startVoiceRecording', recording),
				this.button('Stop + Fit Timing', 'stopVoiceRecording', !recording),
				this.button('Play', 'playVoiceRecording', !ready),
				this.button('Clear', 'clearVoiceRecording', !ready)
			]
		};
	}

	static button(text, action, disabled) {
		return {
			tag: 'button',
			attrs: { className: 'aw-nle-btn', disabled },
			on: { click: action },
			text
		};
	}

	static message(text) {
		return {
			tag: 'div',
			attrs: { className: 'aw-nle-field' },
			text
		};
	}
}
