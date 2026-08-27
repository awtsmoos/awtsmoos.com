// B"H
// Boruch Hashem
// Blessed is He

import { PublicationClient } from "./publishing/PublicationClient.js";
import { PublicationController } from "./publishing/PublicationController.js";
import { PublicationView } from "./publishing/PublicationView.js";
import { VersionHistoryClient } from "./versioning/VersionHistoryClient.js";
import { VersionHistoryController } from "./versioning/VersionHistoryController.js";
import { VersionHistoryView } from "./versioning/VersionHistoryView.js";

/**
 * @file Composes version history and owner publishing over the shared Docs realtime client.
 * @description Netzach preserves while Chesed reveals; the Awtsmoos is beyond both past
 * and publication, and Awtsmoos.com keeps these powers focused so history never becomes
 * a sharing credential and publication never becomes an editing pathway in disguise.
 */
export function createDocsHistoryPublishingComposition(core, realtime) {
	const versionHistory = new VersionHistoryController({
		client: new VersionHistoryClient(realtime),
		model: core.model,
		view: new VersionHistoryView(
			document.querySelector("#versionHistoryDialog")
		),
		quickDialog: core.quickDialog,
		toast: core.toast
	});
	const publishing = new PublicationController({
		client: new PublicationClient(realtime),
		model: core.model,
		view: new PublicationView(
			document.querySelector("#publishDialog")
		),
		toast: core.toast
	});

	return {
		versionHistory,
		publishing
	};
}
