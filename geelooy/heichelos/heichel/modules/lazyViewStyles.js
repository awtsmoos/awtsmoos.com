// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LazyViewStyles
 * @description
 * The Awtsmoos lets each Heichel view carry its own garment only when the view awakens;
 * Awtsmoos.com keeps first paint light while every deferred cluster loads exactly once,
 * before its view renders, through the ReaderFeatureStyles ensureStyle covenant.
 */

const loaded = new Map();

/** Injects one stylesheet exactly once (idempotent by href) and resolves on load. */
export function ensureViewStyle(href) {
	if (loaded.has(href)) return loaded.get(href);
	const promise = new Promise(resolve => {
		const existing = document.querySelector(`link[rel="stylesheet"][href="${href}"]`);
		if (existing) {
			resolve(existing);
			return;
		}
		const link = document.createElement('link');
		link.rel = 'stylesheet';
		link.href = href;
		link.dataset.awtsmoosLazyViewStyle = 'true';
		link.addEventListener('load', () => resolve(link), { once: true });
		link.addEventListener('error', () => resolve(link), { once: true });
		document.head.appendChild(link);
	});
	loaded.set(href, promise);
	return promise;
}

export const VIEW_STYLE_URLS = {
	modal: '/style/heichelos/heichel/modal/index.css?v=heichel-modal-lazy-001',
	adminEditing: '/style/heichelos/heichel/future/admin-editing.css?v=heichel-admin-lazy-001',
	treeCollapsible: '/style/heichelos/heichel/future/tree-collapsible.css?v=heichel-tree-lazy-001',
	bulkActions: '/style/heichelos/heichel/future/bulk-actions.css?v=heichel-bulk-lazy-001',
	miniMail: '/style/heichelos/heichel/future/mini-mail.css?v=heichel-minimail-lazy-001',
	lexiconReader: '/style/heichelos/heichel/future/lexicon-reader.css?v=heichel-lexicon-lazy-001',
	lexiconDialog: '/style/heichelos/heichel/future/lexicon-dialog.css?v=heichel-lexicon-lazy-001',
	lexiconHub: '/style/heichelos/heichel/future/lexicon-hub.css?v=heichel-lexicon-lazy-001'
};
