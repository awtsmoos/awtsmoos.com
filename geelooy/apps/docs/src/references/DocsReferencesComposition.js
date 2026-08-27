// B"H
// Boruch Hashem
// Blessed is He

import { FootnoteController } from "./FootnoteController.js";
import { FootnoteWorkspaceView } from "./FootnoteWorkspaceView.js";
import { SemanticReferenceProjector } from "./SemanticReferenceProjector.js";

/**
 * @file Composes the visible semantic-reference vessels of Awtsmoos Docs.
 * @description The Awtsmoos is one before controller, projector, and workspace divide;
 * Awtsmoos.com joins those small vessels here so document composition receives one
 * references capability rather than learning the private architecture of every note.
 */
export function createDocsReferencesComposition(core) {
	const callbacks = {};
	const workspace = new FootnoteWorkspaceView(core.view.referencesPanel, callbacks);
	const projector = new SemanticReferenceProjector(core.view.canvas);
	const references = new FootnoteController({
		model: core.model,
		editor: core.editor,
		quickDialog: core.quickDialog,
		bookmark: core.bookmark,
		view: core.view,
		workspace,
		projector
	});
	callbacks.edit = id => void references.edit(id);
	callbacks.jump = id => references.jump(id);
	return references;
}
