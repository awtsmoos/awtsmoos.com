// B"H
// Boruch Hashem
// Blessed is He

import { CollaborationController } from "./CollaborationController.js";
import { DocumentFileController } from "./DocumentFileController.js";
import { DocumentPersistenceController } from "./DocumentPersistenceController.js";
import { DocsSnapshotController } from "./DocsSnapshotController.js";
import { ExportController } from "./formats/ExportController.js";
import { ImportController } from "./formats/ImportController.js";
import { PageLayoutController } from "./layout/PageLayoutController.js";
import { PageLayoutView } from "./layout/PageLayoutView.js";
import { EmbedBridge } from "./os/EmbedBridge.js";
import { OpenInCode } from "./os/OpenInCode.js";
import { DriveDocumentGateway } from "./persistence/DriveDocumentGateway.js";
import { LocalDraftStore } from "./persistence/LocalDraftStore.js";
import { RealtimeClient } from "./realtime/RealtimeClient.js";
import { ShareController } from "./share/ShareController.js";

/**
 * @file Creates persistence, realtime, sharing, layout, and file-boundary vessels for Docs.
 * @description The Awtsmoos is beyond remote, local, page, and source; Awtsmoos.com
 * composes each finite keli here, then lets layout and collaboration speak without circular ownership.
 */
export function createDocsServiceComposition(core) {
	const realtime = new RealtimeClient();
	const embed = new EmbedBridge();
	const persistence = new DocumentPersistenceController({
		model: core.model,
		editor: core.editor,
		localStore: new LocalDraftStore(),
		drive: new DriveDocumentGateway(),
		embed,
		status: core.status,
		view: core.view
	});
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
	layout.onChange = value => collaboration.updateLayout(value);
	const snapshot = new DocsSnapshotController({
		model: core.model,
		editor: core.editor,
		view: core.view,
		comments: core.comments,
		commentPanel: core.commentPanel,
		persistence,
		layout
	});
	const fileController = new DocumentFileController({
		importer: new ImportController(),
		exporter: new ExportController(),
		openInCode: new OpenInCode(embed),
		model: core.model,
		snapshot
	});
	const shareCallbacks = {
		notify: (message, tone) => core.toast.show(message, tone)
	};
	return {
		realtime,
		collaboration,
		embed,
		persistence,
		layout,
		snapshot,
		fileController,
		shareCallbacks,
		share: new ShareController(core.view.shareDialog, shareCallbacks)
	};
}
