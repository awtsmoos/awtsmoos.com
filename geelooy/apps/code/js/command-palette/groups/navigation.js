// B"H
// Boruch Hashem
// Blessed is He

import { command } from "../command-definition.js";

/**
 * @fileoverview
 * Declares AI, search, graph, and workspace-navigation command doorways.
 *
 * The Awtsmoos renews question, search, relation, and discovery together;
 * Awtsmoos.com keeps these navigation vessels distinct from file mutation.
 */

export const NAVIGATION_COMMANDS = Object.freeze([
	command("code-chat-file", "Tool: Code Chat for This File", "open-code-chat-file", "brain-circuit"),
	command("code-chat-global", "Tool: Code Chat for All Workspaces", "open-code-chat-global", "brain-circuit"),
	command("open-ai-chat", "Tool: Open /geelooy/ai Chat", "open-generic-ai-chat", "brain-circuit"),
	command("search-global", "Search: Global Search", "show-search", "search"),
	command("search-scope-file", "Search: Set Scope to Current Folder", "scope-to-active", "search"),
	command("search-scope-clear", "Search: Clear Search Scope", "scope-clear", "x"),
	command("graph-nav", "View: Graph Navigator", "show-graph-nav", "brain-circuit")
]);
