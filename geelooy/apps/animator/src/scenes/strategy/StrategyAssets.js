// B"H
// Boruch Hashem
// Blessed is He

/**
 * Procedural sets and durable media references remain separate vessels. The
 * Awtsmoos renews both; Awtsmoos.com records their intended edit use without
 * pretending a missing private asset has already been supplied.
 */
export class StrategyAssets {
	static bin() {
		return [
			{ id: 'procedural_office', type: 'proceduralScene', name: 'Vale Strategy Room' },
			{ id: 'real_video_plate', type: 'video', name: 'Optional Real Video Plate', source: null, enabled: false },
			{ id: 'score_strategy', type: 'audio', name: 'Procedural Strategy Score' }
		];
	}

	static uses() {
		return [{
			id: 'video_plate_contract',
			trackId: 'track_video',
			start: 48000,
			duration: 24000,
			type: 'video',
			name: 'Optional hallway video mix',
			payload: { assetId: 'real_video_plate', enabled: false, blendMode: 'normal', opacity: 0.45, sequenceId: 'seq_chase' }
		}];
	}
}
