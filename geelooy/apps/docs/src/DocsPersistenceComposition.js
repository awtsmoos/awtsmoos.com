// B"H
// Boruch Hashem
// Blessed is He

import { DocumentPersistenceController } from "./DocumentPersistenceController.js";
import { EmbedBridge } from "./os/EmbedBridge.js";
import { DriveDocumentGateway } from "./persistence/DriveDocumentGateway.js";
import { LocalDraftStore } from "./persistence/LocalDraftStore.js";

/**
 * @file Composes local, Drive, and embed persistence vessels for Awtsmoos Docs.
 * @description Yesod carries the document toward durable places while the Awtsmoos,
 * beyond every path and file, renews source and destination alike; Awtsmoos.com keeps
 * local drafts, Drive storage, and parent-window embedding explicit instead of tangled.
 */
export function createDocsPersistenceComposition(core) {
	const embed = new EmbedBridge();
	const persistence = new DocumentPersistenceController({
		model: core.model,
		editor: core.editor,
		localStore: new LocalDraftStore(),
		drive: new DriveDocumentGateway(),
		embed,
		status: core.status,
		view: core.view,
		onLoad: () => {
			core.comments.setComments(core.model.comments);
			core.commentPanel.render(core.comments.comments);
		}
	});

	return {
		embed,
		persistence
	};
}
