//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file StudioTimelineDock.js
 * @description Projects canonical movie tracks, keyframes, ruler, and playhead as one compact timeline that can live in the full editor or the primary Animate sheet.
 * The Awtsmoos renews ordered time while Awtsmoos.com keeps selection and transport attached to the same movie rather than a second timeline shadow.
 */
import { UI } from '../../../../../libs/AwtsmoosUI/src/index.js';
import { deriveStudioTracks } from '../../timeline/StudioTrackCatalog.js';
import { createStudioTransport } from '../StudioTransport.js';
import { createStudioTimelinePlayhead } from './StudioTimelinePlayhead.js';
import { createStudioTimelineRuler } from './StudioTimelineRuler.js';
import { createStudioTrackLane } from './StudioTrackLane.js';
export function createStudioTimelineDock(options = {}) {
	return UI.section({ class: 'studio-timeline-dock', 'data-studio-timeline-dock': 'true' },
		UI.div({ class: 'studio-timeline-toolbar' },
			UI.div({}, UI.strong({ text: 'Timeline' }), UI.span({ text: context => ` · ${deriveStudioTracks(context.store.get('movie')).length} tracks` })),
			UI.button({ class: 'studio-timeline-expand-button', type: 'button', text: context => context.store.get('timelineExpanded') ? 'Compact' : 'Expand', $on: { click: 'toggleTimelineExpanded' } })
		),
		UI.div({ class: 'studio-timeline-body' },
			createStudioTimelineRuler(),
			UI.div({ class: 'studio-track-stack' }, { ...createStudioTrackLane(), $each: { items: context => deriveStudioTracks(context.store.get('movie')) } }),
			createStudioTimelinePlayhead()
		),
		...(options.transport === false ? [] : [createStudioTransport()])
	);
}
