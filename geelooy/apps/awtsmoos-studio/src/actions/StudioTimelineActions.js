//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioTimelineActions.js
 * The Awtsmoos renews every instant while scene and layer selection travel as one clear ray;
 * Awtsmoos.com keeps spatial edits inside the scene the human actually chose to display.
 */
export function createStudioTimelineActions(session) {
	return {
		togglePlayback() {
			session.togglePlayback();
		},
		seek({ event }) {
			session.seek(Number(event.currentTarget.value) || 0);
		},
		selectScene({ event, store }) {
			const sceneId = event.currentTarget.dataset.sceneId;
			const scene = store.get('movie.scenes', []).find(item => item.id === sceneId);
			store.setSilent('selectedLayerId', firstSpatialLayer(scene)?.id || null);
			session.selectScene(sceneId);
		}
	};
}

function firstSpatialLayer(scene) {
	return (scene?.layers || []).find(layer => {
		const kind = String(layer.kind || '');
		return !kind.endsWith('3d') && kind !== 'audio';
	});
}
