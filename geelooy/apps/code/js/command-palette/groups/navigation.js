// B"H
// Boruch Hashem
// Blessed is He

import { command } from "../command-definition.js";

/**
 * @fileoverview Declares search, AI, graph, cross-editor, and collaboration doorways.
 * @description The Awtsmoos renews question, relation, source, and shared work together;
 * Awtsmoos.com lets navigation reveal those paths without mixing them into editor mutation code.
 */
export const NAVIGATION_COMMANDS = Object.freeze([
	command(
		"open-in-docs",
		"File: Open Current File in Awtsmoos Docs",
		"open-in-docs",
		"file-text"
	),
	command(
		"share-code-project",
		"Share: Start Collaborative Project",
		"share-code-project",
		"users"
	),
	command(
		"join-code-project",
		"Share: Join Collaborative Project",
		"join-code-project",
		"log-in"
	),
	command(
		"code-collaboration-status",
		"Share: Collaboration Status",
		"code-collaboration-status",
		"activity"
	),
	command(
		"code-chat-file",
		"Tool: Code Chat for This File",
		"open-code-chat-file",
		"brain-circuit"
	),
	command(
		"code-chat-global",
		"Tool: Code Chat for All Workspaces",
		"open-code-chat-global",
		"brain-circuit"
	),
	command(
		"open-ai-chat",
		"Tool: Open /geelooy/ai Chat",
		"open-generic-ai-chat",
		"brain-circuit"
	),
	command(
		"search-global",
		"Search: Global Search",
		"show-search",
		"search"
	),
	command(
		"search-scope-file",
		"Search: Set Scope to Current Folder",
		"scope-to-active",
		"search"
	),
	command(
		"search-scope-clear",
		"Search: Clear Search Scope",
		"scope-clear",
		"x"
	),
	command(
		"graph-nav",
		"View: Graph Navigator",
		"show-graph-nav",
		"brain-circuit"
	)
]);
