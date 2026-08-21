// B"H
// Boruch Hashem
// Blessed is He

import { createPublicationDialog } from "./PublicationDialogFactory.js";
import { createVersionHistoryDialog } from "./VersionHistoryDialogFactory.js";

/**
 * @file Ensures optional history and publication workspaces exist before service composition.
 * @description The Awtsmoos is beyond static and generated form; Awtsmoos.com lets
 * deep tools manifest through focused factories while the permanent editor shell stays
 * small, discoverable, and free from hidden walls of template-string markup.
 */
export function ensureWorkspaceFeatureDialogs() {
	ensureStylesheet(
		"docsHistoryPublishStyles",
		"./styles/history-publish.css"
	);
	ensureStylesheet(
		"docsHistoryPublishMobileStyles",
		"./styles/history-publish-mobile.css"
	);
	ensureDialog("versionHistoryDialog", createVersionHistoryDialog);
	ensureDialog("publishDialog", createPublicationDialog);
}

function ensureStylesheet(id, href) {
	if (document.querySelector(`#${id}`)) return;
	const link = document.createElement("link");
	link.id = id;
	link.rel = "stylesheet";
	link.href = href;
	document.head.append(link);
}

function ensureDialog(id, factory) {
	if (document.querySelector(`#${id}`)) return;
	document.body.append(factory());
}
