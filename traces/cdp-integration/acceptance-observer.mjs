//B"H
//Boruch Hashem
//Blessed is He

import { mkdir, writeFile } from "node:fs/promises";
import { CdpClient, sleep } from "./cdp-client.mjs";
import { createControlLookupExpression, createPageProbeExpression } from "./page-probe.mjs";

const devtoolsPort = 9240;
const targetId = "DBA653409323BD0B3BDCE996E5D6B00E";
const gameUrl = "http://127.0.0.1:8080/games/mitzvahWorld/?integrationAcceptance=20260724-1000";
const artifactRoot = "/Users/awtsmoos/.awtsmoos-artifacts/mitzvahWorld/final-integration-20260724-0907";
const webSocketUrl = `ws://127.0.0.1:${devtoolsPort}/devtools/page/${targetId}`;
const client = new CdpClient(webSocketUrl);
const evidence = { console: [], exceptions: [], logs: [], requests: new Map(), phases: {} };

function recordEvents() {
	client.on("Runtime.consoleAPICalled", (event) => evidence.console.push(event));
	client.on("Runtime.exceptionThrown", (event) => evidence.exceptions.push(event));
	client.on("Log.entryAdded", ({ entry }) => evidence.logs.push(entry));
	client.on("Network.requestWillBeSent", ({ requestId, request }) => evidence.requests.set(requestId, request.url));
}

async function capturePhase(label, screenshotName) {
	const probe = await client.evaluate(createPageProbeExpression(label));
	const metrics = await client.send("Performance.getMetrics");
	const screenshot = await client.send("Page.captureScreenshot", { format: "png", fromSurface: true });
	await writeFile(`${artifactRoot}/screenshots/${screenshotName}`, screenshot.data, "base64");
	evidence.phases[label] = { probe, metrics: metrics.metrics };
}

async function dispatchKey(key, code, milliseconds = 180) {
	await client.send("Input.dispatchKeyEvent", { type: "keyDown", key, code, windowsVirtualKeyCode: key.charCodeAt(0) });
	await sleep(milliseconds);
	await client.send("Input.dispatchKeyEvent", { type: "keyUp", key, code, windowsVirtualKeyCode: key.charCodeAt(0) });
}

async function clickMatching(pattern) {
	const rect = await client.evaluate(createControlLookupExpression(pattern));
	if (!rect) {
		return null;
	}
	const x = rect.x + rect.width / 2;
	const y = rect.y + rect.height / 2;
	await client.send("Input.dispatchMouseEvent", { type: "mousePressed", x, y, button: "left", clickCount: 1 });
	await client.send("Input.dispatchMouseEvent", { type: "mouseReleased", x, y, button: "left", clickCount: 1 });
	return rect;
}

async function setViewport(width, height, mobile) {
	await client.send("Emulation.setDeviceMetricsOverride", {
		width,
		height,
		deviceScaleFactor: 1,
		mobile,
		screenWidth: width,
		screenHeight: height
	});
	await client.send("Emulation.setTouchEmulationEnabled", { enabled: mobile, maxTouchPoints: mobile ? 5 : 1 });
}

async function main() {
	await mkdir(`${artifactRoot}/screenshots`, { recursive: true });
	await client.open();
	recordEvents();
	for (const method of ["Page.enable", "Runtime.enable", "Network.enable", "Log.enable", "Performance.enable"]) {
		await client.send(method);
	}
	await setViewport(1440, 900, false);
	const loaded = client.waitFor("Page.loadEventFired", 45000);
	await client.send("Page.navigate", { url: gameUrl });
	await loaded;
	await sleep(12000);
	await capturePhase("desktop-initial", "desktop-initial.png");
	await dispatchKey("w", "KeyW", 700);
	await dispatchKey("Tab", "Tab", 120);
	const bagControl = await clickMatching(/bag|inventory/i);
	await sleep(900);
	await capturePhase("desktop-after-input", "desktop-after-input.png");
	await setViewport(390, 844, true);
	await sleep(1200);
	await capturePhase("mobile-390x844", "mobile-390x844.png");
	await setViewport(320, 568, true);
	await sleep(900);
	await capturePhase("mobile-320x568", "mobile-320x568.png");
	evidence.summary = {
		bagControl,
		requestCount: evidence.requests.size,
		requestUrls: [...evidence.requests.values()].slice(0, 220),
		consoleCount: evidence.console.length,
		exceptionCount: evidence.exceptions.length,
		logCount: evidence.logs.length
	};
	delete evidence.requests;
	await writeFile(`${artifactRoot}/reports/cdp-acceptance-observation.json`, JSON.stringify(evidence, null, 2));
	console.log(JSON.stringify(evidence.summary, null, 2));
	client.close();
}

main().catch(async (error) => {
	await writeFile(`${artifactRoot}/reports/cdp-acceptance-error.txt`, `${error.stack || error}\n`);
	console.error(error);
	client.close();
	process.exitCode = 1;
});
