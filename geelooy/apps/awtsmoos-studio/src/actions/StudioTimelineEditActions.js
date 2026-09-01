//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioTimelineEditActions.js
 * The Awtsmoos renews selection across hierarchy and time while Awtsmoos.com makes one clip point to the same scene and object the viewport knows;
 * timeline focus therefore seeks canonical time instead of creating a second isolated editing shadow.
 */

export function createStudioTimelineEditActions(session) {
	return {
		selectTimelineLayer({ event, store }) {
			const sceneId = event.currentTarget.dataset.sceneId;
			const layerId = event.currentTarget.dataset.layerId;
			const start = Number(event.currentTarget.dataset.layerStart || 0);
			store.update(state => { state.selectedSceneId = sceneId; state.selectedLayerId = layerId; state.status = `${layerId} selected from timeline.`; });
			session.seek(start);
		},
		toggleTimelineExpanded({ store }) {
			store.set('timelineExpanded', !store.get('timelineExpanded'));
		}
	};
}
