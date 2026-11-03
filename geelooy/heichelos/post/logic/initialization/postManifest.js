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

async function manifestPrimaryContent(viewport, post) {
	const richRoot = renderRootDocument(viewport, post?.rootDocument);
	const structuredPost = prepareStructuredPost(post);
	let unitsRendered = false;
	if (structuredPost) {
		await interpretPostDayuh(structuredPost);
	} else if (!richRoot && Array.isArray(post?.units) && post.units.length) {
		unitsRendered = renderUnitsPost(viewport, post);
		if (!unitsRendered && post?.content) appendPublicPlainContent(viewport, post.content);
	} else if (!richRoot && post?.content) {
		appendPublicPlainContent(viewport, post.content);
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
