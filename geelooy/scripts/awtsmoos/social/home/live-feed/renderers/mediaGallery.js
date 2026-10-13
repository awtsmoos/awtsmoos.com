// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module MediaGallery
 * @description
 * Image galleries for rich social posts: swipeable carousel, thumbnails,
 * fullscreen lightbox, keyboard navigation. Audio/video attachments get
 * native players with download fallback.
 */
import { createElement, createButton } from '../card/domFactory.js';

/**
 * Extracts media attachments from a post model.
 * @param {object} model - Post model.
 * @returns {object} { images, audio, video }
 */
export function extractMedia(model) {
	const raw = model.raw || {};
	const attachments = Array.isArray(raw.attachments) ? raw.attachments
		: Array.isArray(raw.rootAssets) ? raw.rootAssets
		: Array.isArray(raw.assets) ? raw.assets : [];
	const images = [];
	const audio = [];
	const video = [];
	for (const att of attachments) {
		const type = String(att.type || att.kind || '').toLowerCase();
		const url = att.publicPath || att.url || att.src;
		if (!url) continue;
		const item = { url, caption: att.caption || '', alt: att.alt || att.caption || 'Post image' };
		if (type === 'image' || type === 'gif' || /\.(jpe?g|png|webp|gif|avif)(\?|$)/i.test(url)) {
			images.push(item);
		} else if (type === 'audio' || /\.(mp3|ogg|wav|m4a)(\?|$)/i.test(url)) {
			audio.push({ ...item, duration: att.duration });
		} else if (type === 'video' || /\.(mp4|webm|mov)(\?|$)/i.test(url)) {
			video.push({ ...item, thumbnail: att.thumbnail });
		}
	}
	// Also check legacy single-image fields
	const cover = raw.coverImage || raw.image || raw.thumbnail;
	if (cover && !images.some(i => i.url === cover)) {
		images.unshift({ url: cover, caption: '', alt: model.title || 'Post image' });
	}
	return { images, audio, video };
}

function openLightbox(images, startIndex) {
	const overlay = createElement('div', 'media-lightbox', {
		role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Image viewer'
	});
	let index = startIndex;
	const img = createElement('img', 'media-lightbox-img', { alt: '' });
	const caption = createElement('p', 'media-lightbox-caption');
	const counter = createElement('span', 'media-lightbox-counter');

	function show(i) {
		index = (i + images.length) % images.length;
		img.src = images[index].url;
		img.alt = images[index].alt;
		caption.textContent = images[index].caption || '';
		counter.textContent = `${index + 1} / ${images.length}`;
	}

	const prev = createButton('‹', 'media-lightbox-nav media-lightbox-prev');
	prev.setAttribute('aria-label', 'Previous image');
	const next = createButton('›', 'media-lightbox-nav media-lightbox-next');
	next.setAttribute('aria-label', 'Next image');
	const close = createButton('✕', 'media-lightbox-close');
	close.setAttribute('aria-label', 'Close viewer');

	prev.addEventListener('click', e => { e.stopPropagation(); show(index - 1); });
	next.addEventListener('click', e => { e.stopPropagation(); show(index + 1); });
	close.addEventListener('click', () => document.body.removeChild(overlay));
	overlay.addEventListener('click', e => { if (e.target === overlay) document.body.removeChild(overlay); });
	document.addEventListener('keydown', function onKey(e) {
		if (!document.body.contains(overlay)) {
			document.removeEventListener('keydown', onKey);
			return;
		}
		if (e.key === 'Escape') document.body.removeChild(overlay);
		if (e.key === 'ArrowLeft') show(index - 1);
		if (e.key === 'ArrowRight') show(index + 1);
	});

	overlay.append(close, prev, img, next, caption, counter);
	document.body.append(overlay);
	show(startIndex);
}

/**
 * Renders an image gallery (carousel + thumbnails + lightbox).
 */
export function renderImageGallery(images) {
	if (!images.length) return null;
	const gallery = createElement('div', 'media-gallery', {
		'data-image-count': String(images.length)
	});

	if (images.length === 1) {
		const img = createElement('img', 'media-gallery-single', {
			src: images[0].url, alt: images[0].alt, loading: 'lazy'
		});
		img.addEventListener('click', () => openLightbox(images, 0));
		gallery.append(img);
		return gallery;
	}

	// Carousel
	const track = createElement('div', 'media-gallery-track');
	images.forEach((item, i) => {
		const slide = createElement('div', 'media-gallery-slide');
		const img = createElement('img', '', { src: item.url, alt: item.alt, loading: 'lazy' });
		img.addEventListener('click', () => openLightbox(images, i));
		slide.append(img);
		track.append(slide);
	});
	gallery.append(track);

	// Dots
	const dots = createElement('div', 'media-gallery-dots', { role: 'tablist', 'aria-label': 'Gallery pages' });
	images.forEach((_, i) => {
		const dot = createButton('', 'media-gallery-dot' + (i === 0 ? ' active' : ''));
		dot.setAttribute('aria-label', `Go to image ${i + 1}`);
		dot.addEventListener('click', () => {
			track.scrollTo({ left: track.clientWidth * i, behavior: 'smooth' });
			dots.querySelectorAll('.media-gallery-dot').forEach((d, j) =>
				d.classList.toggle('active', j === i));
		});
		dots.append(dot);
	});
	gallery.append(dots);

	// Counter badge
	gallery.append(createElement('span', 'media-gallery-count', {}, `1 / ${images.length}`));
	track.addEventListener('scroll', () => {
		const i = Math.round(track.scrollLeft / track.clientWidth);
		const badge = gallery.querySelector('.media-gallery-count');
		if (badge) badge.textContent = `${i + 1} / ${images.length}`;
	}, { passive: true });

	return gallery;
}

/**
 * Renders audio attachments with native players.
 */
export function renderAudioAttachments(audioItems) {
	if (!audioItems.length) return null;
	const wrap = createElement('div', 'media-audio-list');
	for (const item of audioItems) {
		const block = createElement('div', 'media-audio-item');
		const player = createElement('audio', 'media-audio-player', {
			src: item.url, controls: '', preload: 'metadata'
		});
		block.append(player);
		if (item.caption) block.append(createElement('p', 'media-audio-caption', {}, item.caption));
		wrap.append(block);
	}
	return wrap;
}

/**
 * Renders video attachments with native players.
 */
export function renderVideoAttachments(videoItems) {
	if (!videoItems.length) return null;
	const wrap = createElement('div', 'media-video-list');
	for (const item of videoItems) {
		const player = createElement('video', 'media-video-player', {
			src: item.url, controls: '', preload: 'metadata',
			playsinline: ''
		});
		if (item.thumbnail) player.poster = item.thumbnail;
		wrap.append(player);
		if (item.caption) wrap.append(createElement('p', 'media-video-caption', {}, item.caption));
	}
	return wrap;
}

/**
 * Renders all media attachments for a post model.
 * @param {object} model - Post model.
 * @returns {HTMLElement|null} Media section or null.
 */
export function renderPostMedia(model) {
	const { images, audio, video } = extractMedia(model);
	if (!images.length && !audio.length && !video.length) return null;
	const section = createElement('div', 'post-media-section');
	const gallery = renderImageGallery(images);
	const audioList = renderAudioAttachments(audio);
	const videoList = renderVideoAttachments(video);
	if (gallery) section.append(gallery);
	if (videoList) section.append(videoList);
	if (audioList) section.append(audioList);
	return section;
}
