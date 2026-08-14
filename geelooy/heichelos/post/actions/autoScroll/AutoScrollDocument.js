// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module AutoScrollDocument
 * @description The Awtsmoos measures and moves the one natural document river,
 * preserving subpixel whispers and direct native writes when helpers are unsure.
 */
function documentElement() {
	return globalThis.document?.documentElement ?? null;
}

function documentBody() {
	return globalThis.document?.body ?? null;
}

export function autoScrollRoot() {
	return globalThis.document?.scrollingElement
		|| documentElement()
		|| documentBody();
}

export function autoScrollTop() {
	const root = autoScrollRoot();
	return Math.max(
		Number(globalThis.window?.scrollY || 0),
		Number(root?.scrollTop || 0),
		Number(documentElement()?.scrollTop || 0),
		Number(documentBody()?.scrollTop || 0)
	);
}

export function documentMax() {
	const root = autoScrollRoot();
	const height = Math.max(
		Number(documentBody()?.scrollHeight || 0),
		Number(documentElement()?.scrollHeight || 0),
		Number(root?.scrollHeight || 0)
	);
	const viewport = globalThis.window?.innerHeight
		|| documentElement()?.clientHeight
		|| root?.clientHeight
		|| 0;
	return Math.max(0, height - viewport);
}

export function writeTop(root, target) {
	if (root) {
		root.scrollTop = target;
	}
}

export function writeAutoScrollDelta(delta) {
	const root = autoScrollRoot();
	const before = autoScrollTop();
	const target = Math.max(0, Math.min(documentMax(), before + delta));
	const amount = target - before;
	if (Math.abs(amount) < 0.001) {
		return 0;
	}
	globalThis.window?.scrollBy?.({
		top: amount,
		left: 0,
		behavior: 'auto'
	});
	if (Math.abs(autoScrollTop() - before) < Math.abs(amount) * 0.35) {
		globalThis.window?.scrollTo?.(0, target);
		writeTop(root, target);
		writeTop(documentElement(), target);
		writeTop(documentBody(), target);
	}
	return autoScrollTop() - before;
}

export function setAutoScrollSmoothDisabled(disabled, savedBehavior) {
	const element = documentElement();
	const body = documentBody();
	if (!element) {
		return savedBehavior;
	}
	if (disabled) {
		const original = savedBehavior ?? element.style.scrollBehavior ?? '';
		element.style.setProperty('scroll-behavior', 'auto', 'important');
		body?.style?.setProperty?.('scroll-behavior', 'auto', 'important');
		return original;
	}
	if (savedBehavior !== null) {
		element.style.scrollBehavior = savedBehavior;
	}
	body?.style?.removeProperty?.('scroll-behavior');
	return null;
}
