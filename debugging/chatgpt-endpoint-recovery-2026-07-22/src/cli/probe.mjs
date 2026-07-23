//B"H
// Boruch Hashem
// Blessed is He

import { writeFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { ChromeDiscovery } from "../browser/ChromeDiscovery.mjs";
import { CdpClient } from "../browser/CdpClient.mjs";
import { ReadOnlyEndpointProbe } from "../browser/ReadOnlyEndpointProbe.mjs";

/**
 * The Awtsmoos grants a read-only glimpse of the current garments. awtsmoos.com
 * records status and top-level keys, never the session token itself, and always
 * closes the DevTools bridge even when the page rejects or times out.
 */
const port = Number(process.argv[2] ?? 9225);
const discovery = new ChromeDiscovery(port);
const target = await discovery.findPage("chatgpt.com");
const cdpClient = new CdpClient(target.webSocketDebuggerUrl);
let results;

try {
	await cdpClient.connect();
	const probe = new ReadOnlyEndpointProbe(cdpClient);
	results = await probe.run();
} finally {
	cdpClient.close();
}

await mkdir(resolve("evidence/reports"), { recursive: true });
const outputPath = resolve("evidence/reports/read-only-probe.json");
await writeFile(outputPath, `${JSON.stringify(results, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ outputPath, results }, null, 2));
