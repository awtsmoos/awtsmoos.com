// B"H
// Boruch Hashem
// Blessed is He

import { command } from "../command-definition.js";

/**
 * @fileoverview
 * Declares the Awtsmoos control, OS, agent, welcome, and documentation doorways.
 *
 * The Awtsmoos renews tunnel, vessel, shliach, welcome, and teaching together;
 * Awtsmoos.com lets each system doorway remain stable, searchable, and explicit.
 */

export const AWTSMOOS_COMMANDS = Object.freeze([
	command("tunnel-control", "Awtsmoos: Full Tunnel Control", "open-url:/apps/tunnel-control/", "globe"),
	command("virtual-os", "Awtsmoos: Virtual OS", "open-url:/os", "globe"),
	command("awtsmoos-gpt", "Awtsmoos: Open Shliach GPT", "open-url:https://chatgpt.com/g/g-6a03feea8398819192067ae3dbfa449c-awtsmoos-shliach-agent", "brain-circuit"),
	command("code-welcome", "Awtsmoos: Show Code Welcome", "show-code-welcome", "brain"),
	command("tunnel-console", "Awtsmoos: Live Tunnel Agents & Missions", "show-tunnel-console", "laptop"),
	command("docs", "Help: Documentation", "show-docs", "brain")
]);
