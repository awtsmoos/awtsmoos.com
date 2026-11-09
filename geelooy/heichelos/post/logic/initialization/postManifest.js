//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module PostManifest
 * @description
 * The Awtsmoos reveals canonical teaching through rich, structured, units, or safe plain vessels in order;
 * Awtsmoos.com keeps the coordinator small while each fallback preserves readable Torah at the reader border.
 */

import { makeNavBars } from '/heichelos/post/postFunctions.js?v=canonical-post-links-002';
import { interpretPostDayuh } from '/heichelos/post/logic/scribe.js';
import { prepareStructuredPost } from '/heichelos/post/logic/scribe/PostSectionSource.js';
import { appendSafePostHtml, isHtmlPostContent } from '/heichelos/post/functions/dom/HtmlManifestation.js?v=safe-post-html-004';
import { renderUnitsPost } from '/heichelos/post/logic/initialization/UnitsManifest.js?v=units-002';
import { renderRootDocument } from '/heichelos/post/ui/RichRootDocument.js?v=rich-social-document-001';
import { renderChitasMasthead } from '../chitas/masthead.js?v=native-chitas-006';
import { appendPublicPlainContent } from './PublicPlainContent.js?v=public-content-001';
import {
	appendHebrewTextFallback,
	appendRootAssets,
	appendTitle,
	renderMode,
	viewportHasVisibleText
} from './PostManifestElements.js?v=post-elements-001';

/** True when the post carries units-shaped content (Torah units or social replies). */
function hasUnitsContent(post) {
	return Array.isArray(post?.units) && post.units.length > 0;
}

/**
 * B"H — Renders post.content: authored HTML (a Meluket maamar's <sup>
 * footnote markers, <h3>, <i>, <br/>) goes through the sanitized HTML path
 * so it parses as HTML; plain/Markdown prose keeps the safe plain path, so
 * untrusted stored text never gains the power of HTML. The description
 * fallback below stays plain-text on purpose (it is prose, never markup).
 * @param {HTMLElement} viewport Canonical post viewport.
 * @param {unknown} content Stored post content.
 * @returns {boolean} True when content was rendered.
 */
function appendPostContent(viewport, content) {
	if (isHtmlPostContent(content)) {
		appendSafePostHtml(content, viewport);
		return viewportHasVisibleText(viewport);
	}
	return appendPublicPlainContent(viewport, content);
}

async function manifestPrimaryContent(viewport, post) {
	const richRoot = renderRootDocument(viewport, post?.rootDocument);
	const structuredPost = prepareStructuredPost(post);
	let unitsRendered = false;
	try {
		if (structuredPost) {
			await interpretPostDayuh(structuredPost);
		} else if (!richRoot && hasUnitsContent(post)) {
			unitsRendered = renderUnitsPost(viewport, post);
			if (!unitsRendered && post?.content) appendPostContent(viewport, post.content);
		} else if (!richRoot && post?.content) {
			appendPostContent(viewport, post.content);
		}
	} catch (error) {
		console.error('B"H primary content manifestation failed; falling back to units/plain:', error);
	}
	// B"H — social/debate permalinks (QA sweep #2 PERMALINK-EMPTY): if the
	// primary path threw or left no visible text, render units directly so
	// the post body is never blank when units exist.
	if (!viewportHasVisibleText(viewport) && hasUnitsContent(post)) {
		try {
			unitsRendered = renderUnitsPost(viewport, post) || unitsRendered;
		} catch (error) {
			console.error('B"H units fallback failed:', error);
		}
	}
	// B"H — last resort: a plain-text description so a social reply with
	// neither sections nor units still shows its words.
	if (!viewportHasVisibleText(viewport) && typeof post?.description === 'string' && post.description.trim()) {
		try {
			appendPublicPlainContent(viewport, post.description);
		} catch (error) {
			console.error('B"H description fallback failed:', error);
		}
	}
	return {
		richRoot,
		structured: Boolean(structuredPost),
		units: unitsRendered
	};
}

/**
 * Manifests one authoritative post without allowing unsafe legacy content to replace the reader shell.
 *
 * @param {HTMLElement} viewport Canonical post viewport.
 * @param {object} post Post API payload.
 * @param {object} series Parent series metadata.
 * @param {number|string} postIndex Ordered series position.
 * @returns {Promise<string>} Render-mode label for reader diagnostics.
 */
export async function manifestPost(viewport, post, series, postIndex) {
	if (!viewport) return 'missing-viewport';
	viewport.innerHTML = '';
	renderChitasMasthead(viewport, post);
	appendTitle(viewport, post);
	appendRootAssets(viewport, post);
	const mode = await manifestPrimaryContent(viewport, post);
	if (!viewportHasVisibleText(viewport)) appendHebrewTextFallback(viewport, post);
	viewport.append(makeNavBars(post, series, postIndex));
	return renderMode(mode);
}
