//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioKeyframeActions.js
 * The Awtsmoos renews timeless potential while Awtsmoos.com lets the playhead crystallize selected transforms into canonical MovieDocument keyframes;
 * these actions reuse the shared sampler's channel language so authored motion and rendered motion remain the same flame.
 */

import { cloneStudioSelection } from '../editor/StudioLayerAccess.js';
import { commitStudioEditorMovie } from '../editor/StudioEditorCommit.js';
import { STUDIO_KEYFRAME_CHANNELS, getStudioChannelValue, studioLayerLocalTime, upsertStudioKeyframe } from '../timeline/StudioKeyframeAccess.js';

export function createStudioKeyframeActions(session) {
	return {
		addSelectedKeyframe({ event, store }) {
			addChannels(session, store, [event.currentTarget.dataset.keyframeChannel]);
		},
		addTransformKeyframeSet({ store }) {
			addChannels(session, store, STUDIO_KEYFRAME_CHANNELS);
		}
	};
}

function addChannels(session, store, channels) {
	const selection = cloneStudioSelection(store.get('movie'), store.get('selectedSceneId'), store.get('selectedLayerId'));
	if (!selection.scene || !selection.layer) return store.set('status', 'Select an object before keyframing.');
	const at = studioLayerLocalTime(store.get('playhead'), selection.scene, selection.layer);
	for (const channel of channels.filter(Boolean)) {
		upsertStudioKeyframe(selection.layer, channel, at, getStudioChannelValue(selection.layer, channel));
	}
	commitStudioEditorMovie(session, store, selection.movie, { status: `${selection.layer.id} · ${channels.length} keyframe${channels.length === 1 ? '' : 's'} at ${at.toFixed(2)}s.` });
}
