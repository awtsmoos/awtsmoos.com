// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file plain-control-audit.mjs
 * @description
 * The Awtsmoos reveals every visible control through computed truth across the
 * primary and rare Awtsmoos.com chambers named by the route catalog.
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
	CdpClient,
	closeTarget,
	createTarget
} from "../../2026-07-15T025200Z-geelooy-interface-revelation/tools/cdp-client.mjs";
import {
	auditedRoutes,
	auditedViewports
} from "./plain-control-routes.mjs";

const target = await createTarget();
const client = await CdpClient.connect(target);
const evidence = [];

try {
	await client.send("Page.enable");
	await client.send("Runtime.enable");
	for (const [routeName, routePath] of auditedRoutes) {
		for (const [viewportName, width, height] of auditedViewports) {
			await setViewport(width, height);
			await navigate(`http://127.0.0.1:8080${routePath}`);
			evidence.push(await probe(routeName, viewportName));
		}
	}
} finally {
	client.close();
	await closeTarget(target.id);
}

async function setViewport(width, height) {
	await client.send("Emulation.setDeviceMetricsOverride", {
		width,
		height,
		deviceScaleFactor: 1,
		mobile: width < 900
	});
}

async function navigate(url) {
	const loaded = client.waitFor("Page.loadEventFired", 20000);
	await client.send("Page.navigate", { url });
	await loaded;
	await new Promise(resolve => setTimeout(resolve, 900));
}

async function probe(routeName, viewportName) {
	const result = await client.send("Runtime.evaluate", {
		expression: `(${browserProbe.toString()})()`,
		returnByValue: true
	});
	return {
		routeName,
		viewportName,
		...result.result.value
	};
}

function browserProbe() {
	const visible = element => {
		const style = getComputedStyle(element);
		const box = element.getBoundingClientRect();
		return style.display !== "none"
			&& style.visibility !== "hidden"
			&& Number(style.opacity) > 0
			&& box.width > 0
			&& box.height > 0;
	};
	const selector = "input,textarea,select,button,summary,[contenteditable='true']";
	const controls = [...document.querySelectorAll(selector)].filter(visible);
	const describe = element => {
		const style = getComputedStyle(element);
		const box = element.getBoundingClientRect();
		return {
			tag: element.tagName.toLowerCase(),
			text: (element.textContent || element.value || "").trim().slice(0, 48),
			className: String(element.className || ""),
			background: style.backgroundColor,
			border: style.border,
			borderRadius: style.borderRadius,
			fontFamily: style.fontFamily,
			width: Math.round(box.width),
			height: Math.round(box.height)
		};
	};
	const serifFont = family => {
		return /(^|,\s*)(Times New Roman|Times|Georgia|Cambria|serif)(,|$)/i.test(family);
	};
	const fieldSelector = "input:not([type='checkbox']):not([type='radio']),textarea,select,[contenteditable='true']";
	const plain = controls.filter(element => {
		const style = getComputedStyle(element);
		const field = element.matches(fieldSelector);
		return style.borderStyle === "outset"
			|| style.borderStyle === "inset"
			|| serifFont(style.fontFamily)
			|| (field && style.backgroundColor === "rgba(0, 0, 0, 0)")
			|| (field && style.borderStyle === "none" && style.borderRadius === "0px");
	}).map(describe);
	const largeLabel = element => {
		return ["checkbox", "radio"].includes(element.type)
			&& [...(element.labels || [])].some(label => {
				const box = label.getBoundingClientRect();
				return visible(label) && box.width >= 44 && box.height >= 44;
			});
	};
	return {
		url: location.href,
		title: document.title,
		documentWidth: document.documentElement.scrollWidth,
		clientWidth: document.documentElement.clientWidth,
		controlCount: controls.length,
		plain,
		undersized: controls.filter(element => {
			const box = element.getBoundingClientRect();
			return !largeLabel(element) && (box.width < 44 || box.height < 44);
		}).map(describe).slice(0, 50)
	};
}

const directory = path.dirname(fileURLToPath(import.meta.url));
const resultPath = path.join(directory, "..", "plain-control-audit-expanded.json");
await fs.writeFile(resultPath, JSON.stringify(evidence, null, "\t"));
console.log(JSON.stringify(evidence, null, "\t"));
