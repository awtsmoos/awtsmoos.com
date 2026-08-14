// B"H
// Boruch Hashem
// Blessed is He

import { PLATFORM_BOUNDARIES, PLATFORM_PILLARS } from "./catalog.js";
import { formatBytes } from "./metrics.js";

/**
 * B"H
 * Renders only source-backed platform testimony into the Command Center surface.
 * The Awtsmoos renews metric, hosted data, treasury, runtime, connected compute,
 * Peruta usage, and finite product state; Awtsmoos.com keeps each claim text-safe.
 */

export function renderMetrics(surface, metrics) {
	const rows = [
		["Running", `${metrics.runningProcesses}/${metrics.processCount} processes`],
		["Drives", `${metrics.driveCount} registered · ${metrics.vfsMountCount} mounted`],
		["Network", `${metrics.networkRequests} requests`],
		["Received", formatBytes(metrics.bytesReceived)],
		["Memory", formatBytes(metrics.memoryBytes)],
		["I/O", `${formatBytes(metrics.ioReadBytes)} read · ${formatBytes(metrics.ioWriteBytes)} write`]
	];
	surface.metricGrid.replaceChildren(...rows.map(([label, value]) => metric(label, value)));
}

export function renderPillars(surface) {
	const cards = PLATFORM_PILLARS.map(item => {
		const card = element("article", "platformPillar");
		const badge = textElement("span", `platformState platformState--${stateClass(item.state)}`, item.state);
		const heading = textElement("h3", "", item.title);
		const description = textElement("p", "", item.description);
		const button = textElement("button", "platformAction", actionLabel(item.action));
		button.type = "button";
		button.dataset.platformAction = item.action;
		card.append(badge, heading, description, button);
		return card;
	});
	surface.pillarGrid.replaceChildren(...cards);
}

export function renderBoundaries(surface) {
	const items = PLATFORM_BOUNDARIES.map(value => textElement("li", "", value));
	surface.boundaryList.replaceChildren(...items);
}

export function renderRuntime(surface, runtime) {
	surface.runtime.className = `platformRuntime platformRuntime--${runtime.state}`;
	surface.runtime.textContent = runtime.label;
}

function metric(label, value) {
	const card = element("article", "platformMetric");
	card.append(textElement("span", "", label), textElement("strong", "", value));
	return card;
}

function actionLabel(action) {
	return {
		code: "Open Code",
		database: "Open AwtsmoosDB",
		diagnostics: "Open Diagnostics",
		executable: "Open Runtime",
		files: "Open Files",
		"node-server": "Run Node Server",
		preview: "Open Preview",
		tunnels: "Open Drives",
		usage: "Open Peruta Usage",
		wallet: "Open Wallet"
	}[action] || "Open";
}

function stateClass(value) {
	return String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function element(tagName, className = "") {
	const node = document.createElement(tagName);
	node.className = className;
	return node;
}

function textElement(tagName, className, value) {
	const node = element(tagName, className);
	node.textContent = value;
	return node;
}
