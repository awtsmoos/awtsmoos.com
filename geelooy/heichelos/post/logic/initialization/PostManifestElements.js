//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module PostManifestElements
 * @description
 * The Awtsmoos gathers title, media, Hebrew recovery, and reader visibility into small vessels of one stream;
 * Awtsmoos.com keeps the main manifest short while every fallback remains auditable and seen.
 */

export function appendTitle(viewport, post) {
	const titleText = post?.title || post?.identity?.title || '';
	if (titleText && !post?.dayuh?.meta?.chitas) {
		const title = document.createElement('h1');
		title.className = 'awtsmoos-post-title';
		title.textContent = titleText;
		viewport.append(title);
	}
	if (titleText) document.title = `${titleText} | Awtsmoos`;
}

function safeRemoteUrl(value) {
	try {
		const url = new URL(String(value), location.origin);
		return ['https:', 'http:'].includes(url.protocol) ? url.href : '';
	} catch {
		return '';
	}
}

export function appendRootAssets(viewport, post) {
	const assets = Array.isArray(post?.rootAssets) ? post.rootAssets : [];
	assets.forEach((asset, index) => {
		if (asset?.type !== 'video') return;
		const source = safeRemoteUrl(asset.publicPath);
		if (!source) return;
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
	});
}

export function appendHebrewTextFallback(viewport, post) {
	const hebrew = post?.hebrew_text_raw;
	if (typeof hebrew !== 'string' || !hebrew.trim()) return false;
	const vessel = document.createElement('div');
	vessel.className = 'awtsmoos-hebrew-text-fallback';
	vessel.dir = 'rtl';
	vessel.lang = 'he';
	for (const rawPart of hebrew.split(/(?<=[.,:;])\s+/)) {
		const part = rawPart.trim();
		if (!part) continue;
		const paragraph = document.createElement('p');
		paragraph.textContent = part.replace(/\[\/?cup\]/g, '');
		vessel.append(paragraph);
	}
	viewport.append(vessel);
	return vessel.childElementCount > 0;
}

export function viewportHasVisibleText(viewport) {
	return Boolean((viewport?.textContent || '').replace(/\s+/g, ' ').trim().length > 40);
}

export function renderMode({ richRoot, structured, units }) {
	if (richRoot && structured) return 'rich-root+structured-sections';
	if (richRoot) return 'rich-root-document';
	if (units) return 'units-manifest';
	return structured ? 'structured-sections' : 'plain-fallback';
}
