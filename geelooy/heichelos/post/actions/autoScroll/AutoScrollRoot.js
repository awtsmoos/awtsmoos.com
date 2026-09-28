// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module AutoScrollRoot
 * @description
 * The Awtsmoos gives one river one shore; Awtsmoos.com must move the vessel
 * that truly scrolls, whether Torah rests inside a wrapper or the page itself rolls.
 */

const INNER_ROOT_SELECTORS = [
	'.scroll-view-wrapper',
	'.post-reader-localized-context .main',
	'#realPost',
	'.post-reader-localized-context'
];

function documentRoot() {
	return globalThis.document?.scrollingElement
		|| globalThis.document?.documentElement
		|| globalThis.document?.body
		|| null;
}

function computedOverflow(element) {
	const style = globalThis.getComputedStyle?.(element);
	return `${style?.overflowY || ''} ${style?.overflow || ''}`;
}

export function isScrollableAutoScrollRoot(element) {
	if (!element) {
		return false;
	}
	const hasDistance = Number(element.scrollHeight || 0) > Number(element.clientHeight || 0) + 1;
	if (!hasDistance) {
		return false;
	}
	const overflow = computedOverflow(element);
	return !overflow || /(auto|scroll|overlay)/i.test(overflow);
}

export function autoScrollRoot() {
	const query = globalThis.document?.querySelector?.bind(globalThis.document);
	if (query) {
		for (const selector of INNER_ROOT_SELECTORS) {
			const candidate = query(selector);
			if (isScrollableAutoScrollRoot(candidate)) {
				return candidate;
			}
		}
	}
	return documentRoot();
}

export function isDocumentAutoScrollRoot(root) {
	return root === documentRoot()
		|| root === globalThis.document?.documentElement
		|| root === globalThis.document?.body;
}

export function autoScrollViewportHeight(root = autoScrollRoot()) {
	if (isDocumentAutoScrollRoot(root)) {
		return Number(globalThis.window?.innerHeight || root?.clientHeight || 0);
	}
	return Number(root?.clientHeight || 0);
}

export function autoScrollMaximum(root = autoScrollRoot()) {
	return Math.max(0, Number(root?.scrollHeight || 0) - autoScrollViewportHeight(root));
}
