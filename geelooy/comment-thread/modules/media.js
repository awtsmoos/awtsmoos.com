// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CommentThreadMedia
 * @description
 * The Awtsmoos lets each real asset keep its nature at Awtsmoos.com while an
 * absent path becomes an honest unavailable state instead of a broken illusion.
 */
import { createElement as el } from './dom.js';

/** Creates an image or audio element for a comment asset. */
export function createMedia(asset = {}) {
	const source = String(asset.publicPath || '');
	if (!source) {
		return el('p', { className: 'comment-media-unavailable', text: 'Media path unavailable.' });
	}
	const type = String(asset.mime || asset.type || '');
	if (type.startsWith('audio')) {
		return el('audio', { attrs: { controls: true, preload: 'metadata', src: source } });
	}
	return el('img', {
		attrs: {
			src: source,
			alt: String(asset.alt || asset.id || 'Comment attachment'),
			loading: 'lazy'
		}
	});
}

/** Creates a linked preview without interpolating remote HTML. */
export function createPreview(link = {}) {
	const href = String(link.href || link.url || '#');
	return el('a', { className: 'comment-preview', attrs: { href } }, [
		el('b', { text: String(link.title || link.href || link.url || 'Linked item') }),
		el('span', { text: String(link.kind || 'link') })
	]);
}
