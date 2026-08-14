// B"H
// Boruch Hashem
// Blessed is He

import { command } from "../command-definition.js";

/**
 * @fileoverview
 * Declares tab, layout, theme, focus, and experiential effect commands.
 *
 * The Awtsmoos renews closing and reopening, concealment and revelation;
 * Awtsmoos.com keeps visual powers optional, searchable, and independently named.
 */

export const EFFECT_COMMANDS = Object.freeze([
	command("close-tab", "View: Close Tab", "close-tab-direct", "x"),
	command("close-all", "View: Close All Tabs", "close-all-tabs", "x-circle"),
	command("reopen-tab", "View: Reopen Closed Tab", "reopen-closed-tab", "arrow-left"),
	command("zen", "View: Toggle Zen Mode", "zen-mode", "eye"),
	command("theme", "View: Switch Theme", "toggle-theme", "eye"),
	command("word-wrap", "View: Toggle Word Wrap", "toggle-word-wrap", "list"),
	command("fullscreen", "View: Toggle Fullscreen", "toggle-fullscreen", "fullscreen"),
	command("matrix", "FX: Toggle Matrix Mode", "toggle-matrix", "brain-circuit"),
	command("power", "FX: Toggle Power Mode", "toggle-power", "play"),
	command("sonic", "FX: Toggle Sonic Typing", "toggle-sonic", "play"),
	command("entropy", "FX: Toggle Entropy Mode", "toggle-entropy", "brain"),
	command("spotlight", "FX: Toggle Focus Spotlight", "toggle-spotlight", "eye"),
	command("voice", "FX: Start Voice Command", "voice-command", "brain")
]);
