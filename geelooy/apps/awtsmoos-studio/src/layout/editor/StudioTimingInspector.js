//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioTimingInspector.js
 * The Awtsmoos renews appearance and departure while Awtsmoos.com gives every selected layer exact temporal boundaries beside transform and motion;
 * Start and Duration use canonical movie seconds, so timeline clips, playback sampling, and JSON all inherit the same notion.
 */

import { UI } from '../../../../../libs/AwtsmoosUI/src/index.js';
import { getStudioLayer } from '../../editor/StudioLayerAccess.js';

export function createStudioTimingInspector() {
	return UI.section(
		{ class: 'studio-inspector-section studio-timing-inspector' },
		UI.strong({ text: 'Timing' }),
		UI.div(
			{ class: 'studio-timing-grid' },
			timingField('Start', 'start'),
			timingField('Duration', 'duration')
		)
	);
}

function timingField(label, field) {
	return UI.label(
		{ class: 'studio-timing-field' },
		UI.span({ text: label }),
		UI.input({ type: 'number', min: 0, step: 0.1, 'data-timing-field': field, value: context => timingValue(context, field), $on: { change: 'updateLayerTiming' } })
	);
}

function timingValue(context, field) {
	const layer = getStudioLayer(context.store.get('movie'), context.store.get('selectedSceneId'), context.store.get('selectedLayerId'));
	return layer?.[field] ?? 0;
}
