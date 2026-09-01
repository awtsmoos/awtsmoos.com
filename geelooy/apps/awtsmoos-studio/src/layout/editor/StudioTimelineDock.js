//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioTimelineDock.js
 * The Awtsmoos renews ordered time while Awtsmoos.com turns canonical movie layers into Premiere-like tracks and After-Effects-like keyframe diamonds beneath the stage;
 * the same playhead, selection, and transport govern every lane, so editing time never becomes a detached second page.
 */

import { UI } from '../../../../../libs/AwtsmoosUI/src/index.js';
import { deriveStudioTracks } from '../../timeline/StudioTrackCatalog.js';
import { createStudioTransport } from '../StudioTransport.js';
import { createStudioTimelineRuler } from './StudioTimelineRuler.js';
import { createStudioTrackLane } from './StudioTrackLane.js';

export function createStudioTimelineDock() {
	return UI.section(
		{ class: 'studio-timeline-dock', 'data-studio-timeline-dock': 'true' },
		UI.div(
			{ class: 'studio-timeline-toolbar' },
			UI.div({}, UI.strong({ text: 'Timeline' }), UI.span({ text: context => ` · ${deriveStudioTracks(context.store.get('movie')).length} tracks · ${context.store.get('movie.duration')}s` })),
			UI.button({ class: 'studio-timeline-expand-button', text: context => context.store.get('timelineExpanded') ? 'Compact' : 'Expand', $on: { click: 'toggleTimelineExpanded' } })
		),
		createStudioTimelineRuler(),
		UI.div({ class: 'studio-track-stack' }, { ...createStudioTrackLane(), $each: { items: context => deriveStudioTracks(context.store.get('movie')) } }),
		createStudioTransport()
	);
}
