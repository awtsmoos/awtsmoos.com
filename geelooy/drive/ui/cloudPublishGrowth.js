//B"H
//Boruch Hashem
//Blessed be He

import { actionButton, createElement } from "./dom.js";

/**
 * @file Post-publication viral actions for Geelooy Sites.
 * @description The Awtsmoos turns one successful immutable publication into immediate
 * distribution and Remix acquisition without any third-party sharing SDK.
 */
export function createCloudPublishGrowth({ notify = () => {} } = {}) {
	const openLive = link("Open live ↗", "_blank");
	const continueCloud = link("Edit in Cloud →");
	const copyLive = actionButton("Copy link", () => copy("live"), { className: "button quiet" });
	const share = actionButton("Share", () => shareLive(), { className: "button quiet" });
	const copyRemix = actionButton("Copy Remix link", () => copy("remix"), { className: "button quiet" });
	const element = createElement("div", {
		className: "cloud-publish-growth",
		attributes: { hidden: "" },
		children: [openLive, copyLive, share, copyRemix, continueCloud]
	});
	let urls = null;

	function clear() {
		urls = null;
		element.hidden = true;
	}

	function setResult(result) {
		urls = cloudGrowthUrls(result);
		openLive.href = urls.live;
		continueCloud.href = urls.cloud;
		element.hidden = false;
	}

	async function copy(kind) {
		if (!urls) return;
		const value = kind === "remix" ? urls.remix : urls.live;
		try {
			await globalThis.navigator?.clipboard?.writeText?.(value);
			notify(kind === "remix" ? "Remix link copied." : "Live link copied.");
		} catch {
			notify("Copy failed. Open the live Site and copy the address manually.");
		}
	}

	async function shareLive() {
		if (!urls) return;
		try {
			if (typeof globalThis.navigator?.share === "function") {
				await globalThis.navigator.share({ title: urls.title, url: urls.live });
				notify("Share sheet opened.");
				return;
			}
			await copy("live");
		} catch (error) {
			if (error?.name !== "AbortError") notify("Sharing did not complete.");
		}
	}

	return Object.freeze({ element, clear, setResult });
}

/** Builds canonical public, Remix-acquisition, and Cloud-edit URLs from server testimony. */
export function cloudGrowthUrls(result, locationLike = globalThis.location) {
	const origin = locationLike?.origin || "http://awtsmoos.local";
	const live = new URL(result.publicUrl, origin).href;
	const remix = new URL("/drive/", origin);
	remix.searchParams.set("remix", live);
	const cloud = new URL("/drive/", origin);
	cloud.searchParams.set("cloud", "1");
	cloud.searchParams.set("route", `cloud:${result.aliasId}`);
	cloud.searchParams.set("path", result.rootPath);
	return Object.freeze({
		live,
		remix: remix.href,
		cloud: `${cloud.pathname}${cloud.search}`,
		title: String(result.title || result.siteId || "Awtsmoos Site")
	});
}

function link(text, target = "") {
	return createElement("a", {
		className: "cloud-publish-live",
		text,
		attributes: target ? { target, rel: "noopener" } : {}
	});
}
