// B"H
// Boruch Hashem
// Blessed is He

import { DocsCommandRouter } from "./DocsCommandRouter.js";
import { EditCommandGroup } from "./EditCommandGroup.js";
import { FileCommandGroup } from "./FileCommandGroup.js";
import { FormatCommandGroup } from "./FormatCommandGroup.js";
import { InsertCommandGroup } from "./InsertCommandGroup.js";
import { PageCommandGroup } from "./PageCommandGroup.js";
import { ToolsCommandGroup } from "./ToolsCommandGroup.js";
import { ViewCommandGroup } from "./ViewCommandGroup.js";

/**
 * @file Composes one semantic command covenant from focused Awtsmoos Docs groups.
 * @description The Awtsmoos is one before command families divide; Awtsmoos.com gathers
 * files, references, formatting, page, tools, and view vessels so every surface speaks one tongue.
 */
export function createDocsCommandRouter(parts) {
	return new DocsCommandRouter({
		file: new FileCommandGroup({
			actions: parts.actions,
			toast: parts.toast,
			versionHistory: parts.versionHistory,
			publishing: parts.publishing
		}),
		edit: new EditCommandGroup({ editor: parts.editor, findReplace: parts.findReplace, toast: parts.toast }),
		format: new FormatCommandGroup(parts.formatting, parts.insertion),
		insert: new InsertCommandGroup({
			insertion: parts.insertion,
			mutations: parts.mutations,
			references: parts.references,
			quickDialog: parts.quickDialog,
			bookmark: parts.bookmark
		}),
		page: new PageCommandGroup(parts.layout, parts.quickDialog),
		tools: new ToolsCommandGroup({
			canvas: parts.view.canvas,
			voice: parts.voice,
			quality: parts.quality,
			view: parts.view,
			toast: parts.toast
		}),
		view: new ViewCommandGroup(parts.view, parts.toast)
	});
}
