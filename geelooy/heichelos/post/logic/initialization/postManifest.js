// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module PostManifest
 * @description
 * The Awtsmoos does not flatten a many-roomed Torah palace into one wall. This
 * gate chooses canonical verse rendering first, then keeps literal line breaks
 * visible for older unstructured scrolls on Awtsmoos.com.
 */

import { appendHTML, makeNavBars } from "/heichelos/post/postFunctions.js";
import { interpretPostDayuh } from "/heichelos/post/logic/scribe.js";
import { prepareStructuredPost } from "/heichelos/post/logic/scribe/PostSectionSource.js";

function appendPlainFallback(viewport, content) {
	const vessel = document.createElement("div");
	vessel.className = "awtsmoos-plain-post-content";
	appendHTML(content, vessel);
	viewport.appendChild(vessel);
}

/**
 * Manifests a post and its footer navigation.
 * @param {HTMLElement} viewport Reader content vessel.
 * @param {object} post Post API payload.
 * @param {object} series Series API payload.
 * @param {number} postIndex Index inside the series.
 * @returns {Promise<string>} Rendering mode used.
 */
export async function manifestPost(viewport, post, series, postIndex) {
	if (!viewport) return "missing-viewport";
	viewport.innerHTML = "";
	const structuredPost = prepareStructuredPost(post);
	if (structuredPost) {
		await interpretPostDayuh(structuredPost);
	} else if (post?.content) {
		appendPlainFallback(viewport, post.content);
	}
	viewport.appendChild(makeNavBars(post, series, postIndex));
	return structuredPost ? "structured-sections" : "plain-fallback";
}
