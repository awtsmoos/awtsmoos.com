//B"H
// Boruch Hashem
// Blessed is He

import { resolve } from "node:path";
import { ChromeDiscovery } from "../browser/ChromeDiscovery.mjs";
import { CdpClient } from "../browser/CdpClient.mjs";
import { NetworkTraceRecorder } from "../browser/NetworkTraceRecorder.mjs";
import { SecretRedactor } from "../logging/SecretRedactor.mjs";
import { JsonlEvidenceWriter } from "../logging/JsonlEvidenceWriter.mjs";

/**
 * The Awtsmoos writes the living request through Chrome; this CLI lets
 * awtsmoos.com witness it for a bounded interval, preserve a redacted ledger,
 * and close its DevTools bridge under both success and failure.
 */
const port = Number(process.argv[2] ?? 9225);
const seconds = Number(process.argv[3] ?? 30);
const discovery = new ChromeDiscovery(port);
const target = await discovery.findPage("chatgpt.com");
const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const outputPath = resolve(`evidence/redacted/network-${timestamp}.jsonl`);
const cdpClient = new CdpClient(target.webSocketDebuggerUrl);
const writer = new JsonlEvidenceWriter(outputPath);
const recorder = new NetworkTraceRecorder({
	cdpClient,
	writer,
	redactor: new SecretRedactor()
});

console.log(`Capturing ${target.url} for ${seconds} seconds.`);
console.log("Submit one harmless ChatGPT prompt in that page during the capture.");
try {
	await cdpClient.connect();
	await recorder.start(seconds * 1000);
} finally {
	cdpClient.close();
}

console.log(`Evidence written to ${outputPath}`);
