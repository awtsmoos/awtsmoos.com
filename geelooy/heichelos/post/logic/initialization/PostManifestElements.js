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

function rootAssetKind(asset) {
	const type = String(asset?.type || asset?.kind || asset?.mime || asset?.contentType || '').toLowerCase();
	if (type.includes('audio')) return 'audio';
	if (type.includes('video')) return 'video';
	const url = String(asset?.publicPath || asset?.url || '');
	if (/\.(mp3|wav|ogg|m4a|aac|flac)(\?.*)?$/i.test(url)) return 'audio';
	if (/\.(mp4|webm|mov|m4v|ogv)(\?.*)?$/i.test(url)) return 'video';
	return '';
}

export function appendRootAssets(viewport, post) {
	// B"H — the reader plays the post's media: the first-class `media` field
	// (one audio + one video) leads, and root assets follow without repeats.
	// Audio attachments were previously dropped here entirely; only video
	// root assets rendered.
	const seen = new Set();
	const queue = [];
	const push = asset => {
		const kind = rootAssetKind(asset);
		if (kind !== 'audio' && kind !== 'video') return;
		const source = safeRemoteUrl(asset?.publicPath || asset?.url);
		if (!source || seen.has(source)) return;
		seen.add(source);
		queue.push({ asset, kind, source });
	};
	if (post?.media && typeof post.media === 'object') {
		push(post.media.video);
		push(post.media.audio);
	}
	const assets = Array.isArray(post?.rootAssets) ? post.rootAssets : [];
	assets.forEach(push);
	queue.forEach(({ asset, kind, source }, index) => {
		const figure = document.createElement('figure');
		figure.className = `awtsmoos-post-${kind}-asset`;
		figure.dataset.assetIndex = String(index);
		const player = document.createElement(kind);
		player.className = `awtsmoos-post-${kind}`;
		player.controls = true;
		player.preload = 'metadata';
		if (kind === 'video') player.playsInline = true;
		player.src = source;
		player.setAttribute('aria-label', asset.alt || asset.caption || asset.originalName || `Post ${kind}`);
		figure.append(player);
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
