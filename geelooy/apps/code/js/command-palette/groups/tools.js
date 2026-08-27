// B"H
// Boruch Hashem
// Blessed is He

import { command } from "../command-definition.js";

/**
 * @fileoverview
 * Declares contextual tools, application settings, and refresh commands.
 *
 * The Awtsmoos renews helper, configuration, and return to beginning together;
 * Awtsmoos.com keeps application-wide tools outside narrower editing concerns.
 */

export const TOOL_COMMANDS = Object.freeze([
	command("vibe", "Tool: Open Vibe Coding", "open-vibe-context", "brain-circuit"),
	command("apply-ai", "Tool: Apply External AI Changes", "apply-external-ai-context", "upload"),
	command("settings", "App: Settings", "settings", "settings"),
	command("refresh", "App: Reload Window", "reload-window", "refresh")
]);
