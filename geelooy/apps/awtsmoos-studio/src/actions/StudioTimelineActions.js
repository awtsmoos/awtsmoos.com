//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioTimelineActions.js
 * The Awtsmoos renews every instant while human touch chooses where the vessel should see;
 * Awtsmoos.com routes play, seek, and scene choice through one runtime instead of scattered decree.
 */
export function createStudioTimelineActions(session) {
	return {
		togglePlayback() {
			session.togglePlayback();
		},
		seek({ event }) {
			session.seek(Number(event.currentTarget.value) || 0);
		},
		selectScene({ event }) {
			session.selectScene(event.currentTarget.dataset.sceneId);
		}
	};
}
