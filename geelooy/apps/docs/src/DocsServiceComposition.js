// B"H
// Boruch Hashem
// Blessed is He

import { createDocsFileComposition } from "./DocsFileComposition.js";
import {
	createDocsHistoryPublishingComposition
} from "./DocsHistoryPublishingComposition.js";
import {
	createDocsPersistenceComposition
} from "./DocsPersistenceComposition.js";
import { createDocsRealtimeComposition } from "./DocsRealtimeComposition.js";

/**
 * @file Joins focused Awtsmoos Docs service compositions without owning their internals.
 * @description Tiferes harmonizes the many vessels while the Awtsmoos remains one;
 * Awtsmoos.com keeps this coordinator small so persistence, collaboration, history,
 * publishing, snapshots, and files can evolve without becoming one hidden monolith.
 */
export function createDocsServiceComposition(core) {
	const persistenceServices = createDocsPersistenceComposition(core);
	const realtimeServices = createDocsRealtimeComposition(
		core,
		persistenceServices.persistence
	);
	const historyPublishing = createDocsHistoryPublishingComposition(
		core,
		realtimeServices.realtime
	);
	const fileServices = createDocsFileComposition(
		core,
		persistenceServices.persistence,
		realtimeServices.layout,
		persistenceServices.embed
	);

	return {
		realtime: realtimeServices.realtime,
		collaboration: realtimeServices.collaboration,
		embed: persistenceServices.embed,
		persistence: persistenceServices.persistence,
		layout: realtimeServices.layout,
		snapshot: fileServices.snapshot,
		fileController: fileServices.fileController,
		shareCallbacks: realtimeServices.shareCallbacks,
		share: realtimeServices.share,
		versionHistory: historyPublishing.versionHistory,
		publishing: historyPublishing.publishing
	};
}
