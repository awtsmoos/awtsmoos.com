// B"H
// Boruch Hashem
// Blessed is He

/**
 * The production bin contains procedural worlds, imported picture, voices,
 * score, and effects as explicit editable assets. The Awtsmoos renews every
 * medium while Awtsmoos.com keeps source, intent, and track placement truthful.
 */
export class FourMinuteAssets {
	static bin(characters) {
		return [
			...characters.map(character => ({
				id: character.voice.id,
				type: 'voice',
				name: character.voice.label,
				characterId: character.identityId,
				timbre: character.voice.timbre
			})),
			{ id: 'festival_real_video', type: 'video', name: 'Original Festival Crowd Plate', source: null, enabled: false },
			{ id: 'festival_score', type: 'audio', name: 'Unscheduled Tuesday Score' },
			{ id: 'storm_foley', type: 'audio', name: 'Storm, city, train, and lantern foley' },
			{ id: 'procedural_worlds', type: 'proceduralScene', name: 'Eight indoor and outdoor environments' }
		];
	}

	static uses() {
		return [
			this.use('video_festival', 'track_video', 210000, 18000, 'video', 'Festival crowd plate', { assetId: 'festival_real_video', enabled: false, opacity: 0.38, blendMode: 'screen', sequenceId: 'seq_festival' }),
			this.use('music_main', 'track_music', 0, 240000, 'audio', 'Four-minute original score', { assetId: 'festival_score', gain: 0.34 }),
			this.use('foley_city', 'track_effects', 30000, 150000, 'effect', 'Doors, footsteps, traffic, storm, train', { assetId: 'storm_foley', gain: 0.5 }),
			this.use('foley_festival', 'track_effects', 210000, 30000, 'effect', 'Lantern and festival movement', { assetId: 'storm_foley', gain: 0.42 })
		];
	}

	static use(id, trackId, start, duration, type, name, payload) {
		return { id, trackId, start, duration, type, name, payload };
	}
}
