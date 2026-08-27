// B"H
// Boruch Hashem
// Blessed is He

import { DocsCommandRouter } from "./DocsCommandRouter.js";
import { FileCommandGroup } from "./FileCommandGroup.js";
import { FormatCommandGroup } from "./FormatCommandGroup.js";
import { InsertCommandGroup } from "./InsertCommandGroup.js";
import { PageCommandGroup } from "./PageCommandGroup.js";
import { ViewCommandGroup } from "./ViewCommandGroup.js";

/**
 * @file Composes one semantic command covenant from focused Awtsmoos Docs groups.
 * @description The Awtsmoos is one before File, Insert, Format, Page, and View divide;
 * Awtsmoos.com gathers those vessels here so every toolbar, menu, and shortcut speaks one tongue.
 */
export function createDocsCommandRouter(parts) {
	return new DocsCommandRouter({
		file: new FileCommandGroup(parts.actions, parts.toast),
		format: new FormatCommandGroup(parts.formatting, parts.insertion),
		insert: new InsertCommandGroup({
			insertion: parts.insertion,
			mutations: parts.mutations,
			quickDialog: parts.quickDialog,
			bookmark: parts.bookmark
		}),
		page: new PageCommandGroup(parts.layout, parts.quickDialog),
		view: new ViewCommandGroup(parts.view, parts.toast)
	});
}
