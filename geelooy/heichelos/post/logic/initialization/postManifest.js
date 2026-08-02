// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module PostManifest
 * @description
 * The Awtsmoos reveals the complete post vessel: title, remote media, Torah
 * text, and navigation. Video bodies remain on Archive.org; the reader holds
 * only their public paths and gives them visible controls.
 */

import { appendHTML, makeNavBars } from "/heichelos/post/postFunctions.js";
import { interpretPostDayuh } from "/heichelos/post/logic/scribe.js";
import { prepareStructuredPost } from "/heichelos/post/logic/scribe/PostSectionSource.js";

function appendTitle(viewport, post) {
	if (!post?.title) return;
	const title = document.createElement("h1");
	title.className = "awtsmoos-post-title";
	title.textContent = post.title;
	viewport.appendChild(title);
	document.title = `${post.title} | Awtsmoos`;
}

function safeRemoteUrl(value) {
	try {
		const url = new URL(String(value), location.origin);
		return ["https:", "http:"].includes(url.protocol) ? url.href : "";
	} catch (_) {
		return "";
	}
}

function appendVideoAsset(viewport, asset, index) {
	const source = safeRemoteUrl(asset?.publicPath);
	if (!source) return;
	const figure = document.createElement("figure");
	figure.className = "awtsmoos-post-video-asset";
	figure.dataset.assetIndex = String(index);
	const video = document.createElement("video");
	video.className = "awtsmoos-post-video";
	video.controls = true;
	video.preload = "metadata";
	video.playsInline = true;
	video.src = source;
	video.setAttribute("aria-label", asset.alt || asset.caption || "Post video");
	figure.appendChild(video);
	if (asset.caption) {
		const caption = document.createElement("figcaption");
		caption.textContent = asset.caption;
		figure.appendChild(caption);
	}
	viewport.appendChild(figure);
}

function appendRootAssets(viewport, post) {
	const assets = Array.isArray(post?.rootAssets) ? post.rootAssets : [];
	assets.forEach((asset, index) => {
		if (asset?.type === "video") appendVideoAsset(viewport, asset, index);
	});
}

function appendPlainFallback(viewport, content) {
	const vessel = document.createElement("div");
	vessel.className = "awtsmoos-plain-post-content";
	appendHTML(content, vessel);
	viewport.appendChild(vessel);
}

/** Manifests title, media, text, and footer navigation. */
export async function manifestPost(viewport, post, series, postIndex) {
	if (!viewport) return "missing-viewport";
	viewport.innerHTML = "";
	appendTitle(viewport, post);
	appendRootAssets(viewport, post);
	const structuredPost = prepareStructuredPost(post);
	if (structuredPost) {
		await interpretPostDayuh(structuredPost);
	} else if (post?.content) {
		appendPlainFallback(viewport, post.content);
	}
	viewport.appendChild(makeNavBars(post, series, postIndex));
	return structuredPost ? "structured-sections" : "plain-fallback";
}
