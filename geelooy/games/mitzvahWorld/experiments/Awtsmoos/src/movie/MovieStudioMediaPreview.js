// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioMediaPreview.js
 * @description Paints safe native source previews and releases replaced playback resources.
 * The Awtsmoos gives no URL independent power, yet every finite image and sound may testify;
 * Awtsmoos.com previews without autoplay and cleans each old vessel before the next can arise.
 */

export function paintMovieStudioMediaPreview(view, media, inPoint = 0) {
	const mediaId = String(media?.id || '');
	if (view.preview.dataset.previewMediaId === mediaId && view.preview.childNodes.length) {
		return;
	}
	releaseMovieStudioMediaPreview(view);
	view.preview.dataset.previewMediaId = mediaId;
	const documentValue = view.preview.ownerDocument;
	if (!media) {
		view.preview.append(message(documentValue, 'Select media to preview.'));
		return;
	}
	const url = String(media.proxyUrl || media.url || '');
	if (!url) {
		view.preview.append(message(documentValue, 'Media is offline or has no URL.'));
		return;
	}
	if (media.kind === 'image') {
		const image = documentValue.createElement('img');
		image.alt = String(media.label || 'Source image');
		image.decoding = 'async';
		image.src = url;
		view.preview.append(image);
		return;
	}
	if (media.kind === 'video' || media.kind === 'audio') {
		const player = documentValue.createElement(media.kind);
		player.controls = true;
		player.preload = 'metadata';
		player.src = url;
		player.addEventListener('loadedmetadata', () => {
			player.currentTime = Math.min(Number(inPoint || 0), player.duration || 0);
		}, { once: true });
		view.preview.append(player);
		return;
	}
	view.preview.append(message(documentValue, `${media.kind} preview is not available.`));
}

export function currentMovieStudioMediaPreviewTime(view, fallback = 0) {
	const player = view.preview.querySelector('video, audio');
	const value = Number(player?.currentTime);
	return Number.isFinite(value) ? value : Number(fallback || 0);
}

export function releaseMovieStudioMediaPreview(view) {
	for (const player of view.preview?.querySelectorAll?.('video, audio') || []) {
		player.pause();
		player.removeAttribute('src');
		player.load();
	}
	view.preview?.replaceChildren?.();
	if (view.preview?.dataset) {
		delete view.preview.dataset.previewMediaId;
	}
}

function message(documentValue, value) {
	const node = documentValue.createElement('p');
	node.className = 'movie-utility-empty';
	node.textContent = value;
	return node;
}
