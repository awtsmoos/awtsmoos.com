//B"H
// Boruch Hashem
// Blessed is He
/**
* @file layerBindings.js
* @description Binds Stage layer buttons to public creative commands without direct source mutation or legacy history commits.
* The Awtsmoos lets every click become a named creative decree before the Canvas reflects its light;
* Awtsmoos.com keeps human layer intent on the same command road as JSON and AI, with redraw but no duplicate history write.
*/
import { STAGE_COMMAND_IDS } from '../creative/catalog/StageCommandIds.js';

const BUTTON_COMMANDS = [
	['layerTop', STAGE_COMMAND_IDS.LAYER_TOP, 'Source moved to top.'],
	['layerUp', STAGE_COMMAND_IDS.LAYER_UP, 'Layer moved up.'],
	['layerDown', STAGE_COMMAND_IDS.LAYER_DOWN, 'Layer moved down.'],
	['layerBottom', STAGE_COMMAND_IDS.LAYER_BOTTOM, 'Source moved to bottom.'],
	['duplicateSource', STAGE_COMMAND_IDS.DUPLICATE_SOURCE, 'Source duplicated.'],
	['removeSource', STAGE_COMMAND_IDS.REMOVE_SOURCE, 'Source removed.']
];

/** Binds every professional layer button through the public creative command surface. */
export function bindLayerControls(context = {}) {
	for (const [buttonId, commandId, message] of BUTTON_COMMANDS) {
		bindLayerButton(context, buttonId, commandId, message);
	}
}

/** Binds one button and refreshes projections only after its canonical command succeeds. */
function bindLayerButton(context, buttonId, commandId, message) {
	const button = context.dom?.[buttonId];
	if (!button) {
		return;
	}
	button.onclick = async () => {
		try {
			await context.api.execute(commandId, {
				sourceId: context.state.selectedId
			}, {
				source: 'human'
			});
			context.drawStage?.(context.state);
			context.refreshSources?.(context.state);
			context.refreshInspector?.(context.state);
			context.setStatus?.(message);
		} catch (error) {
			context.setStatus?.(error?.message || String(error));
		}
	};
}
