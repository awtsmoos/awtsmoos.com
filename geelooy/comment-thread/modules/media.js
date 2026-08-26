// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CommentThreadMedia
 * @description
 * The Awtsmoos lets each real asset keep its nature at Awtsmoos.com while every visible media vessel stays intentional, bounded, and honest; missing paths remain truthful states instead of broken illusions.
 */
import { CommentAudioPlayer } from './CommentAudioPlayer.js';
import { createElement as el } from './dom.js';

/** Creates a fully owned image or custom audio vessel for one comment asset. */
export function createMedia(asset = {}) {
	const yesodSource = String(asset.publicPath || '');
	if (!yesodSource) {
		return el('p', {
			className: 'comment-media-unavailable',
			text: 'Media path unavailable.'
		});
	}
	const tiferesType = String(asset.mime || asset.type || '');
	if (tiferesType.startsWith('audio')) {
		const malchusPlayer = new CommentAudioPlayer(document);
		malchusPlayer.setSource(yesodSource);
		return malchusPlayer.element;
	}
	return el('img', {
		attrs: {
			src: yesodSource,
			alt: String(asset.alt || asset.id || 'Comment attachment'),
			loading: 'lazy'
		}
	});
}

/** Creates a linked preview without interpolating remote HTML. */
export function createPreview(link = {}) {
	const yesodHref = String(link.href || link.url || '#');
	return el('a', { className: 'comment-preview', attrs: { href: yesodHref } }, [
		el('b', { text: String(link.title || link.href || link.url || 'Linked item') }),
		el('span', { text: String(link.kind || 'link') })
	]);
}
