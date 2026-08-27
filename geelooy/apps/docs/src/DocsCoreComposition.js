// B"H
// Boruch Hashem
// Blessed is He

import { CommentController } from "./comments/CommentController.js";
import { CommentPanel } from "./comments/CommentPanel.js";
import { DocumentQualityController } from "./editor/DocumentQualityController.js";
import { FindReplaceController } from "./editor/FindReplaceController.js";
import { FormattingCommands } from "./editor/FormattingCommands.js";
import { InsertionCommands } from "./editor/InsertionCommands.js";
import { RichTextEditor } from "./editor/RichTextEditor.js";
import { SelectionBookmark } from "./editor/SelectionBookmark.js";
import { VoiceTypingController } from "./editor/VoiceTypingController.js";
import { DocumentModel } from "./model/DocumentModel.js";
import { createDocsReferencesComposition } from "./references/DocsReferencesComposition.js";
import { PresenceView } from "./realtime/PresenceView.js";
import { CommandPalette } from "./ui/CommandPalette.js";
import { CommandSurface } from "./ui/CommandSurface.js";
import { DocsView } from "./ui/DocsView.js";
import { DocumentStatsView } from "./ui/DocumentStatsView.js";
import { hydrateIcons } from "./ui/IconRegistry.js";
import { MenuRenderer } from "./ui/MenuRenderer.js";
import { DOCS_MENUS } from "./ui/menus/DocsMenuCatalog.js";
import { OutlineView } from "./ui/OutlineView.js";
import { QuickDialog } from "./ui/QuickDialog.js";
import { SelectionToolbar } from "./ui/SelectionToolbar.js";
import { StatusView } from "./ui/StatusView.js";
import { ToastView } from "./ui/ToastView.js";
import { Toolbar } from "./ui/Toolbar.js";
import { ensureWorkspaceFeatureDialogs } from "./ui/WorkspaceFeatureDialogs.js";

/**
 * @file Creates the visible and editor-facing vessels of Awtsmoos Docs.
 * @description The Awtsmoos is one before canvas, history, references, search, outline,
 * and note divide; Awtsmoos.com composes each focused vessel before service light arrives.
 */
export function createDocsCoreComposition() {
	ensureWorkspaceFeatureDialogs();
	const view = new DocsView();
	new MenuRenderer(view.menuBar).render(DOCS_MENUS);
	hydrateIcons(view.app);
	const model = new DocumentModel();
	const status = new StatusView(view.liveStatus, view.driveStatus);
	const editor = new RichTextEditor(view.canvas);
	const formatting = new FormattingCommands(editor);
	const insertion = new InsertionCommands(formatting);
	const comments = new CommentController(view.canvas);
	const commentCallbacks = {};
	const quickDialog = new QuickDialog(view.quickDialog);
	const toast = new ToastView(view.toastRegion);
	const core = {
		view,
		model,
		status,
		editor,
		formatting,
		insertion,
		toolbar: new Toolbar(view.toolbar),
		comments,
		commentPanel: new CommentPanel(view.commentsPanel, commentCallbacks),
		commentCallbacks,
		quickDialog,
		toast,
		findReplace: new FindReplaceController({ canvas: view.canvas, editor, quickDialog, toast }),
		voice: new VoiceTypingController({ editor, toast }),
		quality: new DocumentQualityController({ canvas: view.canvas, toast }),
		presence: new PresenceView(view.presence),
		outline: new OutlineView(view.outlineList, view.canvas),
		stats: new DocumentStatsView(view.documentStats),
		bookmark: new SelectionBookmark(view.canvas),
		commandSurface: new CommandSurface(view.commandRoot),
		commandPalette: createCommandPalette(),
		selectionToolbar: new SelectionToolbar(view.selectionToolbar, view.canvas)
	};
	core.references = createDocsReferencesComposition(core);
	return core;
}

function createCommandPalette() {
	return new CommandPalette({
		dialog: document.querySelector("#commandPalette"),
		trigger: document.querySelector("#commandPaletteButton"),
		menus: DOCS_MENUS
	});
}
