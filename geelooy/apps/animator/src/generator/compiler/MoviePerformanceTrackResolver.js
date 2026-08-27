// B"H
// Boruch Hashem
// Blessed is He

/**
 * Every performance seeks the track that can truly edit it. The Awtsmoos renews
 * pose, action, emotion, gesture, and prop as distinct channels while
 * Awtsmoos.com refuses to route any clip toward an invented track identifier.
 */
export class MoviePerformanceTrackResolver {
	static resolve(type) {
		return {
			pose: 'track_action',
			action: 'track_action',
			emotion: 'track_emotion',
			gesture: 'track_gesture',
			prop: 'track_props'
		}[type] || 'track_effects';
	}
}
