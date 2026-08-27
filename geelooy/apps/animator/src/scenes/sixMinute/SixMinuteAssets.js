// B"H
// Boruch Hashem
// Blessed is He

/**
 * The production bin names every voice, fragment, environment, score, and
 * effect as an editable vessel. The Awtsmoos renews every medium while
 * Awtsmoos.com keeps source and timeline usage explicit rather than hidden.
 */
export class SixMinuteAssets {
	static bin(characters) {
		return [
			...characters.map((character) => ({
				id: character.voice.id,
				type: 'voice',
				name: character.voice.label,
				characterId: character.identityId,
				timbre: character.voice.timbre
			})),
			...['silver', 'blue', 'cyan', 'orange', 'violet', 'green'].map((color) => ({
				id: `${color}_fragment`,
				type: 'proceduralObject',
				name: `${color} autonomous beacon fragment`
			})),
			{ id: 'beacon_score', type: 'audio', name: 'Six-fragment pursuit score' },
			{ id: 'beacon_foley', type: 'audio', name: 'Impacts, weather, transit, water, cables, glass, and power foley' },
			{ id: 'beacon_worlds', type: 'proceduralScene', name: 'Twelve cinematic interior and exterior environments' }
		];
	}

	static uses() {
		return [
			this.use('music_beacon', 'track_music', 0, 360000, 'audio', 'Six-minute pursuit score', { assetId: 'beacon_score', gain: 0.34 }),
			this.use('foley_school', 'track_effects', 0, 90000, 'effect', 'Beacon fracture, gravity hall, and tunnel pursuit', { assetId: 'beacon_foley', gain: 0.54 }),
			this.use('foley_city', 'track_effects', 90000, 150000, 'effect', 'Flood, market, archive, greenhouse, and bridge', { assetId: 'beacon_foley', gain: 0.58 }),
			this.use('foley_finale', 'track_effects', 240000, 120000, 'effect', 'Tower, rooftop, station, and dawn release', { assetId: 'beacon_foley', gain: 0.62 })
		];
	}

	static use(id, trackId, start, duration, type, name, payload) {
		return { id, trackId, start, duration, type, name, payload };
	}
}
