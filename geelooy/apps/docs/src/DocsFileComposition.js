// B"H
// Boruch Hashem
// Blessed is He

import { DocumentFileController } from "./DocumentFileController.js";
import { DocsSnapshotController } from "./DocsSnapshotController.js";
import { ExportController } from "./formats/ExportController.js";
import { ImportController } from "./formats/ImportController.js";
import { OpenInCode } from "./os/OpenInCode.js";

/**
 * @file Composes canonical snapshots with import, export, and Awtsmoos Code handoff.
 * @description Malchus receives the document into concrete file forms while the Awtsmoos
 * remains beyond every extension; Awtsmoos.com keeps snapshot truth in one vessel so
 * import, export, saving, and source handoff do not invent competing document shapes.
 */
export function createDocsFileComposition(core, persistence, layout, embed) {
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

	return {
		snapshot,
		fileController
	};
}
