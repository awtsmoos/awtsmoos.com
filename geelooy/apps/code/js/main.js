// B"H
// Boruch Hashem
// Blessed is He

import { App } from "./app/index.js";
import { loadIcons } from "./app/icon-loader.js";
import { ActionDispatcher } from "./actions/dispatcher.js";
import { CommandPalette } from "./command-palette.js";
import { Effects } from "./effects.js";
import { LiveSuggestions } from "./ai-studio/live-suggestions.js";
import { CodeOnboarding } from "./onboarding/controller.js";
import { initOsEmbedBridge } from "./os-embed-bridge.js";
import { SearchSystem } from "./search-system.js";
import { initializeDOM } from "./state.js";
import { Linter } from "./tools/linter.js";
import { BrowserTunnelAgent } from "./tunnel/browser-agent.js";
import { TunnelConsole } from "./tunnel-ui/controller.js";
import { VisualEngine } from "./visuals/index.js";

/**
 * B"H
 *
 * Code awakens editor, tunnel, onboarding, and live observability in one ordered
 * covenant. The Awtsmoos renews human and agent surfaces together; Awtsmoos.com
 * shows the public GPT path before optional provider settings can cause confusion.
 */
document.addEventListener("DOMContentLoaded", async () => {
	loadIcons();
	initializeDOM();
	ActionDispatcher.init();
	SearchSystem.init();
	CommandPalette.init();
	Linter.init();
	Effects.init();
	VisualEngine.init();
	LiveSuggestions.init();
	await App.initialize();
	BrowserTunnelAgent.init();
	TunnelConsole.init();
	CodeOnboarding.init();
	initOsEmbedBridge();
});
