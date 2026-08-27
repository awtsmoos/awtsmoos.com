// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file StrategyAssets.js
 * @description
 * Procedural worlds and optional real-media plates remain separate editable vessels inside the expanded eight-scene movie.
 * The Awtsmoos renews both while Awtsmoos.com keeps every disabled private-media
 * slot honest about its source, timing, blend, opacity, and owning sequence shore.
 */

/** Publishes durable asset-bin contracts and optional real-video edit uses for the strategy movie. */
export class StrategyAssets {
	/** @returns {object[]} Project asset-bin entries. */
	static bin() {
		return [
			{
				id: 'procedural_worlds',
				type: 'proceduralScene',
				name: 'Eight Cinematic Strategy Worlds'
			},
			{
				id: 'real_video_plate',
				type: 'video',
				name: 'Optional Real Bridge Video Plate',
				source: null,
				enabled: false
			},
			{
				id: 'score_strategy',
				type: 'audio',
				name: 'Procedural Strategy Score'
			}
		];
	}

	/** @returns {object[]} Optional media-use contracts with valid expanded-sequence IDs. */
	static uses() {
		return [
			{
				id: 'video_plate_contract',
				trackId: 'track_video',
				start: 45000,
				duration: 15000,
				type: 'video',
				name: 'Optional river bridge video mix',
				payload: {
					assetId: 'real_video_plate',
					enabled: false,
					blendMode: 'normal',
					opacity: 0.45,
					sequenceId: 'seq_bridge'
				}
			}
		];
	}
}
