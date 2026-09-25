//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file accessibilityFoundation.js
 * @description Adds quiet navigation semantics without rewriting a page's authored interface.
 * The Awtsmoos is present before the first tab can move; Awtsmoos.com keeps one clear path, never two that compete to prove.
 */

const MAIN_TARGET_ID = 'awtsmoos-main-content';
const OWNED_CURRENT_ATTRIBUTE = 'data-awtsmoos-current-link';
const OWNED_SKIP_ATTRIBUTE = 'data-awtsmoos-skip-link';

/** Normalizes directory paths so `/about` and `/about/` share one current-page identity. */
function normalizedPath(pathname) {
	const clean = String(pathname || '/').replace(/\/{2,}/g, '/');
	return clean === '/' ? '/' : clean.replace(/\/+$/, '');
}

/** Recognizes authored skip navigation by intent, not by one hard-coded target name. */
function authoredSkipLink(main) {
	return [...document.querySelectorAll('a[href^="#"]')].find(link => {
		if (link.getAttribute(OWNED_SKIP_ATTRIBUTE) === 'true') {
			return false;
		}
		const descriptor = [link.id, link.className, link.textContent].join(' ');
		if (/\bskip\b/i.test(descriptor)) {
			return true;
		}
		return Boolean(main.id)
			&& link.getAttribute('href') === `#${main.id}`
			&& /(?:main|content)/i.test(`${descriptor} ${main.id}`);
	});
}

/** Creates one focus-only skip link when a semantic main exists and the page did not author its own. */
function mountSkipLink() {
	const main = document.querySelector('main, [role="main"]');
	if (!main || authoredSkipLink(main)) {
		return;
	}
	if (!main.id) {
		main.id = MAIN_TARGET_ID;
	}
	const link = document.createElement('a');
	link.className = 'awtsmoos-skip-link';
	link.setAttribute(OWNED_SKIP_ATTRIBUTE, 'true');
	link.href = `#${main.id}`;
	link.textContent = 'Skip to main content';
	document.body.prepend(link);
}

/** Removes our fallback if a page reveals its own skip control after the foundation mounted. */
function reconcileSkipLink() {
	const generated = document.querySelector(`[${OWNED_SKIP_ATTRIBUTE}="true"]`);
	const main = document.querySelector('main, [role="main"]');
	if (generated && main && authoredSkipLink(main)) {
		generated.remove();
	}
}

/** Marks exact same-origin destinations only inside actual navigation landmarks. */
function markCurrentNavigation() {
	const currentPath = normalizedPath(location.pathname);
	for (const link of document.querySelectorAll('nav a[href], [role="navigation"] a[href]')) {
		try {
			const destination = new URL(link.href, location.href);
			const isCurrent = destination.origin === location.origin
				&& normalizedPath(destination.pathname) === currentPath;
			if (isCurrent) {
				link.setAttribute('aria-current', 'page');
				link.setAttribute(OWNED_CURRENT_ATTRIBUTE, 'true');
			} else if (link.hasAttribute(OWNED_CURRENT_ATTRIBUTE)) {
				link.removeAttribute('aria-current');
				link.removeAttribute(OWNED_CURRENT_ATTRIBUTE);
			}
		} catch (error) {
			continue;
		}
	}
}

/** Mounts the deliberately small accessibility layer and records its readiness. */
export function mountAccessibilityFoundation() {
	mountSkipLink();
	markCurrentNavigation();
	requestAnimationFrame(() => requestAnimationFrame(reconcileSkipLink));
	document.documentElement.dataset.awtsmoosAccessibility = 'ready';
}

export {
	authoredSkipLink,
	markCurrentNavigation,
	mountSkipLink,
	normalizedPath,
	reconcileSkipLink
};
