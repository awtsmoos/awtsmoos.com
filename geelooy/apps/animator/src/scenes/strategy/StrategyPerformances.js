// B"H
// Boruch Hashem
// Blessed is He

/**
 * Acting continues beyond the mouth: sitting, listening, reaching, anger,
 * surprise, laughter, and prop contact remain editable clips. The Awtsmoos
 * renews each beat while Awtsmoos.com preserves its appointed track and time.
 */
export class StrategyPerformances {
	static create(id) {
		return [
			this.performance('perf_seated', 'pose', id('practicalParent'), 0, 10000, 'Seated with strategy folder', { pose: 'seated', prop: 'strategyFolder', interaction: 'hold' }),
			this.performance('perf_listen', 'emotion', id('practicalParent'), 2500, 4300, 'Skeptical listening reaction', { emotion: 'skeptical', listening: true }),
			this.performance('perf_sheet', 'prop', id('brainyKid'), 13000, 3800, 'Point at stretching strategy sheet', { prop: 'strategySheet', interaction: 'point' }),
			this.performance('perf_surprised', 'emotion', id('inventorParent'), 24000, 6200, 'Surprised escape reaction', { emotion: 'shocked', listening: true }),
			this.performance('perf_walk', 'action', id('inventorParent'), 34000, 32000, 'Family chase walk cycle', { action: 'walk', armSwing: 0.8, walkSpeed: 1.1 }),
			this.performance('perf_annoyed', 'emotion', id('dryTalkingPet'), 30000, 18000, 'Annoyed reaction', { emotion: 'annoyed', gaze: [-0.6, 0] }),
			this.performance('perf_angry', 'emotion', id('practicalParent'), 57500, 4200, 'Frustrated calendar command', { emotion: 'angry', posture: 'assertive' }),
			this.performance('perf_calendar', 'prop', id('practicalParent'), 57500, 4200, 'Raise the accountability calendar', { prop: 'calendar', interaction: 'lift' }),
			this.performance('perf_wave', 'gesture', id('wildToddler'), 76000, 9000, 'Negotiating wave', { gesture: 'wave', intensity: 0.9 }),
			this.performance('perf_smile', 'emotion', id('inventorParent'), 74500, 5200, 'Warm negotiating smile', { emotion: 'warm', listening: false }),
			this.performance('perf_laugh', 'emotion', id('brainyKid'), 92000, 22000, 'Relieved laugh and smile', { emotion: 'laughing', gaze: [0.4, -0.1] })
		];
	}

	static performance(id, type, characterId, start, duration, name, payload) {
		return {
			id,
			type,
			characterId,
			start,
			duration,
			name,
			payload,
			sequenceId: this.sequence(start)
		};
	}

	static sequence(start) {
		if (start < 24000) return 'seq_briefing';
		if (start < 48000) return 'seq_escape';
		if (start < 72000) return 'seq_chase';
		if (start < 96000) return 'seq_negotiation';
		return 'seq_tag';
	}
}
