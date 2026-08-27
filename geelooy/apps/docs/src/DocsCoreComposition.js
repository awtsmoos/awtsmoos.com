// B"H
// Boruch Hashem
// Blessed is He

import { CommentController } from "./comments/CommentController.js";
import { CommentPanel } from "./comments/CommentPanel.js";
import { FormattingCommands } from "./editor/FormattingCommands.js";
import { InsertionCommands } from "./editor/InsertionCommands.js";
import { SelectionBookmark } from "./editor/SelectionBookmark.js";
import { RichTextEditor } from "./editor/RichTextEditor.js";
import { DocumentModel } from "./model/DocumentModel.js";
import { PresenceView } from "./realtime/PresenceView.js";
import { CommandSurface } from "./ui/CommandSurface.js";
import { DocsView } from "./ui/DocsView.js";
import { DocumentStatsView } from "./ui/DocumentStatsView.js";
import { hydrateIcons } from "./ui/IconRegistry.js";
import { OutlineView } from "./ui/OutlineView.js";
import { QuickDialog } from "./ui/QuickDialog.js";
import { SelectionToolbar } from "./ui/SelectionToolbar.js";
import { StatusView } from "./ui/StatusView.js";
import { ToastView } from "./ui/ToastView.js";
import { Toolbar } from "./ui/Toolbar.js";

/**
 * @file Creates the visible and editor-facing vessels of Awtsmoos Docs.
 * @description The Awtsmoos is one before canvas, icon, menu, outline, and note divide;
 * Awtsmoos.com constructs each visible keli here while persistence and realtime remain elsewhere.
 */
export function createDocsCoreComposition() {
	const view = new DocsView();
	hydrateIcons(view.app);
	const model = new DocumentModel();
	const status = new StatusView(view.liveStatus, view.driveStatus);
	const editor = new RichTextEditor(view.canvas);
	const formatting = new FormattingCommands(editor);
	const insertion = new InsertionCommands(formatting);
	const toolbar = new Toolbar(view.toolbar);
	const comments = new CommentController(view.canvas);
	const commentCallbacks = {};
	const commentPanel = new CommentPanel(view.commentsPanel, commentCallbacks);
	return {
		view,
		model,
		status,
		editor,
		formatting,
		insertion,
		toolbar,
		comments,
		commentPanel,
		commentCallbacks,
		presence: new PresenceView(view.presence),
		quickDialog: new QuickDialog(view.quickDialog),
		toast: new ToastView(view.toastRegion),
		outline: new OutlineView(view.outlineList, view.canvas),
		stats: new DocumentStatsView(view.documentStats),
		bookmark: new SelectionBookmark(view.canvas),
		commandSurface: new CommandSurface(view.commandRoot),
		selectionToolbar: new SelectionToolbar(view.selectionToolbar, view.canvas)
	};
}
