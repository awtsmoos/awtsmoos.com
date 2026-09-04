// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module PostManifest
 * @description
 * The Awtsmoos reveals title, native Chitas context, media, rich documents, Torah sections, and navigation as one stream;
 * Awtsmoos.com keeps every ordinary post intact while a Chitas day lets its focused Torah masthead become the single crown it has seen.
 */

import { appendHTML, makeNavBars } from '/heichelos/post/postFunctions.js?v=canonical-post-links-001';
import { interpretPostDayuh } from '/heichelos/post/logic/scribe.js';
import { prepareStructuredPost } from '/heichelos/post/logic/scribe/PostSectionSource.js';
import { renderRootDocument } from '/heichelos/post/ui/RichRootDocument.js?v=rich-social-document-001';
import { renderChitasMasthead } from '../chitas/masthead.js?v=native-chitas-004';

function appendTitle(viewport, post) {
	if (!post?.title || post?.dayuh?.meta?.chitas) {
		return;
	}
	const title = document.createElement('h1');
	title.className = 'awtsmoos-post-title';
	title.textContent = post.title;
	viewport.append(title);
	document.title = `${post.title} | Awtsmoos`;
}

function updateDocumentTitle(post) {
	if (!post?.title) {
		return;
	}
	document.title = `${post.title} | Awtsmoos`;
}

function safeRemoteUrl(value) {
	try {
		const url = new URL(String(value), location.origin);
		return ['https:', 'http:'].includes(url.protocol) ? url.href : '';
	} catch {
		return '';
	}
}

function appendVideoAsset(viewport, asset, index) {
	const source = safeRemoteUrl(asset?.publicPath);
	if (!source) {
		return;
	}
	const figure = document.createElement('figure');
	figure.className = 'awtsmoos-post-video-asset';
	figure.dataset.assetIndex = String(index);
	const video = document.createElement('video');
	video.className = 'awtsmoos-post-video';
	video.controls = true;
	video.preload = 'metadata';
	video.playsInline = true;
	video.src = source;
	video.setAttribute('aria-label', asset.alt || asset.caption || 'Post video');
	figure.append(video);
	if (asset.caption) {
		const caption = document.createElement('figcaption');
		caption.textContent = asset.caption;
		figure.append(caption);
	}
	viewport.append(figure);
}

function appendRootAssets(viewport, post) {
	const assets = Array.isArray(post?.rootAssets) ? post.rootAssets : [];
	assets.forEach((asset, index) => {
		if (asset?.type === 'video') {
			appendVideoAsset(viewport, asset, index);
		}
	});
}

function appendPlainFallback(viewport, content) {
	const vessel = document.createElement('div');
	vessel.className = 'awtsmoos-plain-post-content';
	appendHTML(content, vessel);
	viewport.append(vessel);
}

function renderMode({ richRoot, structured }) {
	if (richRoot && structured) {
		return 'rich-root+structured-sections';
	}
	if (richRoot) {
		return 'rich-root-document';
	}
	return structured ? 'structured-sections' : 'plain-fallback';
}

export async function manifestPost(viewport, post, series, postIndex) {
	if (!viewport) {
		return 'missing-viewport';
	}
	viewport.innerHTML = '';
	renderChitasMasthead(viewport, post);
	appendTitle(viewport, post);
	updateDocumentTitle(post);
	appendRootAssets(viewport, post);
	const richRoot = renderRootDocument(viewport, post?.rootDocument);
	const structuredPost = prepareStructuredPost(post);
	if (structuredPost) {
		await interpretPostDayuh(structuredPost);
	} else if (!richRoot && post?.content) {
		appendPlainFallback(viewport, post.content);
	}
	viewport.append(makeNavBars(post, series, postIndex));
	return renderMode({ richRoot, structured: Boolean(structuredPost) });
}
