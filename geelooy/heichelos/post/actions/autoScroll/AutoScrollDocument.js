// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module AutoScrollDocument
 * @description
 * The Awtsmoos joins measure and motion in one river; Awtsmoos.com reads and
 * writes the same living scroll root so the visible control can never drift apart.
 */
import {
	autoScrollMaximum,
	autoScrollRoot,
	isDocumentAutoScrollRoot
} from './AutoScrollRoot.js';

function numericScrollTop(root) {
	if (!root) {
		return 0;
	}
	if (isDocumentAutoScrollRoot(root)) {
		return Math.max(
			Number(globalThis.window?.scrollY || 0),
			Number(root.scrollTop || 0)
		);
	}
	return Number(root.scrollTop || 0);
}

export { autoScrollRoot } from './AutoScrollRoot.js';

export function autoScrollTop() {
	return numericScrollTop(autoScrollRoot());
}

export function documentMax() {
	return autoScrollMaximum(autoScrollRoot());
}

export function writeTop(root, target) {
	if (!root) {
		return;
	}
	if (isDocumentAutoScrollRoot(root)) {
		globalThis.window?.scrollTo?.(0, target);
	}
	root.scrollTop = target;
}

export function writeAutoScrollDelta(delta) {
	const root = autoScrollRoot();
	const before = numericScrollTop(root);
	const target = Math.max(0, Math.min(autoScrollMaximum(root), before + delta));
	const amount = target - before;
	if (Math.abs(amount) < 0.001) {
		return 0;
	}
	if (isDocumentAutoScrollRoot(root)) {
		globalThis.window?.scrollBy?.({ top: amount, left: 0, behavior: 'auto' });
	}
	if (!isDocumentAutoScrollRoot(root) || Math.abs(numericScrollTop(root) - before) < Math.abs(amount) * 0.35) {
		writeTop(root, target);
	}
	return numericScrollTop(root) - before;
}

export function setAutoScrollSmoothDisabled(disabled, savedBehavior) {
	const root = autoScrollRoot();
	if (!root?.style) {
		return savedBehavior;
	}
	if (disabled) {
		const original = savedBehavior ?? root.style.scrollBehavior ?? '';
		root.style.scrollBehavior = 'auto';
		return original;
	}
	if (savedBehavior !== null && savedBehavior !== undefined) {
		root.style.scrollBehavior = savedBehavior;
	}
	return null;
}
