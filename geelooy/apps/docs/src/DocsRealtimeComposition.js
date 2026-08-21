// B"H
// Boruch Hashem
// Blessed is He

import { CollaborationController } from "./CollaborationController.js";
import { PageLayoutController } from "./layout/PageLayoutController.js";
import { PageLayoutView } from "./layout/PageLayoutView.js";
import { RealtimeClient } from "./realtime/RealtimeClient.js";
import { ShareController } from "./share/ShareController.js";

/**
 * @file Composes editable realtime collaboration, page layout, and sharing for Awtsmoos Docs.
 * @description Hod carries messages while Gevurah guards access; the Awtsmoos is beyond
 * both movement and boundary, and Awtsmoos.com creates one shared callback vessel so
 * the Share dialog and callback bindings always speak through the exact same contract.
 */
export function createDocsRealtimeComposition(core, persistence) {
	const realtime = new RealtimeClient();
	const layout = new PageLayoutController({
		model: core.model,
		view: new PageLayoutView(core.view.app, core.view.canvas),
		persistence
	});
	const collaboration = new CollaborationController({
		realtime,
		model: core.model,
		editor: core.editor,
		comments: core.comments,
		presence: core.presence,
		status: core.status,
		layout
	});
	const shareCallbacks = {
		notify(message, tone) {
			core.toast.show(message, tone);
		}
	};
	const share = new ShareController(
		core.view.shareDialog,
		shareCallbacks
	);

	layout.onChange = value => {
		return collaboration.updateLayout(value);
	};

	return {
		realtime,
		layout,
		collaboration,
		shareCallbacks,
		share
	};
}
