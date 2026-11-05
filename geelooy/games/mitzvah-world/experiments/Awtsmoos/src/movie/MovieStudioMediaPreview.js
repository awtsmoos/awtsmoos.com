// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioMediaPreview.js
 * @description Paints, transports, reports, and releases safe native source previews.
 * The Awtsmoos gives no URL independent power, yet every finite image and sound may testify;
 * Awtsmoos.com previews without autoplay and cleans each old vessel before the next can arise.
 */

import { movieFrameDuration } from './MoviePlaybackRate.js';

export function paintMovieStudioMediaPreview(view, media, inPoint = 0) {
	const mediaId = String(media?.id || '');
	if (view.preview.dataset.previewMediaId === mediaId && view.preview.childNodes.length) return;
	releaseMovieStudioMediaPreview(view);
	view.preview.dataset.previewMediaId = mediaId;
	const documentValue = view.preview.ownerDocument;
	if (!media) return appendMessage(view, 'Select media to preview.');
	const url = String(media.proxyUrl || media.url || '');
	if (!url) return appendMessage(view, 'Media is offline or has no URL.');
	if (media.kind === 'image') {
		const image = documentValue.createElement('img');
		image.alt = String(media.label || 'Source image');
		image.decoding = 'async';
		image.src = url;
		view.preview.append(image);
		emitSourcePreviewState(view);
		return;
	}
	if (media.kind === 'video' || media.kind === 'audio') {
		const player = documentValue.createElement(media.kind);
		player.controls = true;
		player.preload = 'metadata';
		player.src = url;
		for (const type of ['timeupdate', 'play', 'pause', 'ended']) {
			player.addEventListener(type, () => emitSourcePreviewState(view));
		}
		player.addEventListener('loadedmetadata', () => {
			player.currentTime = Math.min(Number(inPoint || 0), finiteDuration(player));
			emitSourcePreviewState(view);
		}, { once: true });
		view.preview.append(player);
		return;
	}
	appendMessage(view, `${media.kind} preview is not available.`);
}

export function currentMovieStudioMediaPreviewTime(view, fallback = 0) {
	const value = Number(player(view)?.currentTime);
	return Number.isFinite(value) ? value : Number(fallback || 0);
}

export function toggleMovieStudioMediaPreview(view) {
	const mediaPlayer = player(view);
	if (!mediaPlayer) return sourcePreviewState(view);
	if (mediaPlayer.paused) mediaPlayer.play().catch(() => emitSourcePreviewState(view));
	else mediaPlayer.pause();
	return sourcePreviewState(view);
}

export function stepMovieStudioMediaPreview(view, frames, fps) {
	const mediaPlayer = player(view);
	if (!mediaPlayer) return sourcePreviewState(view);
	mediaPlayer.pause();
	const target = mediaPlayer.currentTime + Number(frames || 0) * movieFrameDuration(fps);
	mediaPlayer.currentTime = Math.max(0, Math.min(finiteDuration(mediaPlayer), target));
	emitSourcePreviewState(view);
	return sourcePreviewState(view);
}

export function sourcePreviewState(view) {
	const mediaPlayer = player(view);
	return {
		duration: mediaPlayer ? finiteDuration(mediaPlayer) : 0,
		playing: Boolean(mediaPlayer && !mediaPlayer.paused),
		time: currentMovieStudioMediaPreviewTime(view, 0)
	};
}

export function releaseMovieStudioMediaPreview(view) {
	for (const mediaPlayer of view.preview?.querySelectorAll?.('video, audio') || []) {
		mediaPlayer.pause();
		mediaPlayer.removeAttribute('src');
		mediaPlayer.load();
	}
	view.preview?.replaceChildren?.();
	if (view.preview?.dataset) delete view.preview.dataset.previewMediaId;
}

function emitSourcePreviewState(view) {
	view.preview.dispatchEvent(new CustomEvent('movie-source-preview-state', {
		bubbles: true, detail: sourcePreviewState(view)
	}));
}

function appendMessage(view, value) {
	const node = view.preview.ownerDocument.createElement('p');
	node.className = 'movie-utility-empty';
	node.textContent = value;
	view.preview.append(node);
}

function finiteDuration(mediaPlayer) {
	return Number.isFinite(mediaPlayer.duration) ? mediaPlayer.duration : 0;
}

function player(view) {
	return view.preview?.querySelector?.('video, audio') || null;
}
