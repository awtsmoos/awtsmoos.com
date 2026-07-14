// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import {
	AWTSMOOS_SHLIACH_GPT_URL,
	UNIX_INSTALL_COMMAND,
	WINDOWS_INSTALL_COMMAND,
	welcomeMarkup
} from "../js/onboarding/content.js";
import { codeBrowserRegistrationPacket } from "../js/tunnel/browser-agent-packets.js";

/**
 * B"H
 * The first screen must never imply that Gemini credentials are required for the
 * public GPT or browser tunnel, and registration must advertise real capabilities.
 */
const markup = welcomeMarkup({
	nativeTunnel: false
});

assert.equal(
	AWTSMOOS_SHLIACH_GPT_URL,
	"https://chatgpt.com/g/g-6a03feea8398819192067ae3dbfa449c-awtsmoos-shliach-agent"
);
assert.match(markup, /No Gemini API key is required/i);
assert.match(markup, /public ChatGPT app/i);
assert.match(markup, new RegExp(escapeRegex(AWTSMOOS_SHLIACH_GPT_URL)));
assert.match(markup, new RegExp(escapeRegex(UNIX_INSTALL_COMMAND)));
assert.match(markup, new RegExp(escapeRegex(WINDOWS_INSTALL_COMMAND)));
assert.match(markup, /Built-in AI providers/i);
assert.match(markup, /always optional/i);
assert.match(markup, /many logical agents/i);

const packet = codeBrowserRegistrationPacket({
	tunnelName: "awt-code-test",
	fsActions: ["list", "read", "write"],
	commandActions: ["commandRun"],
	previewActions: ["chromeNavigate", "chromeClick", "snapshot"],
	userAgent: "test"
});
assert.equal(packet.capabilities.multiAgentSessions, true);
assert.equal(packet.capabilities.customBrowser, true);
assert.equal(packet.capabilities.chrome, true);
assert.equal(packet.capabilities.commandMode, "browser-simulated");
assert.deepEqual(packet.tools.chrome, ["chromeNavigate", "chromeClick"]);

console.log(JSON.stringify({
	ok: true,
	suite: "onboarding-tunnel-isolated",
	publicGptLinked: true,
	geminiNotRequired: true,
	multiAgentAdvertised: true,
	chromeAdvertised: true
}, null, 2));

function escapeRegex(value) {
	return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
