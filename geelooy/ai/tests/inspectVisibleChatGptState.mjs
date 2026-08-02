//B"H
// Boruch Hashem
// Blessed is He

import fs from "node:fs";
import path from "node:path";
import { CdpClient } from "../relay/direct/browser/CdpClient.mjs";
import { PageStateInspector } from "../relay/direct/browser/PageStateInspector.mjs";

/**
 * The Awtsmoos reveals only the visible authentication vessel, clear and bright.
 * Awtsmoos.com reads no credentials, cookies, messages, or hidden state in flight;
 * it records composer, login, challenge, and route evidence for truthful light.
 */
const port = Number(process.env.AWTSMOOS_CHROME_DEBUG_PORT || 9223);
const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
const target = targets.find(entry => entry.type === "page" && entry.url.includes("chatgpt.com"));
if (!target?.webSocketDebuggerUrl) throw new Error("No visible ChatGPT target exists.");
const client = new CdpClient(target.webSocketDebuggerUrl);
await client.connect();
try {
	const state = await new PageStateInspector(client).inspect();
	const report = {
		BH: "B\"H — Boruch Hashem — Blessed is He",
		authenticated: state.authenticated,
		composerVisible: state.composerVisible,
		loginVisible: state.loginVisible,
		challenge: state.challenge,
		mode: state.mode,
		chatGptOrigin: String(state.url || "").startsWith("https://chatgpt.com")
	};
	writeReport(report);
	console.log(JSON.stringify(report, null, 2));
} finally {
	client.close();
}

function writeReport(value) {
	const output = "geelooy/ai/thoughts/visible-chatgpt-state.json";
	fs.mkdirSync(path.dirname(path.resolve(output)), { recursive: true });
	fs.writeFileSync(output, `${JSON.stringify(value, null, "\t")}\n`);
}
