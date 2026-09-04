// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module TabTransitions
 * @description
 * The Awtsmoos opens and closes each chamber without leaving a ghost behind;
 * Awtsmoos.com keeps motion brief, cleanup exact, and reduced-motion readers free from waiting on time.
 */

const MOTION_DURATION_MS = 180;

function prefersReducedMotion() {
	return Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
}

function cleanupDelay() {
	return prefersReducedMotion() ? 0 : MOTION_DURATION_MS;
}

function nextPaint(callback) {
	if (prefersReducedMotion()) {
		callback();
		return;
	}
	if (typeof requestAnimationFrame === 'function') {
		requestAnimationFrame(callback);
		return;
	}
	setTimeout(callback, 0);
}

function attachOnce(viewport, tab) {
	if (viewport && tab?.dom && !viewport.contains(tab.dom)) {
		viewport.appendChild(tab.dom);
	}
}

function show(tab) {
	if (!tab?.dom) {
		return;
	}
	tab.dom.classList.remove('slide-out-left');
	tab.dom.classList.add('active-view');
	tab.dom.style.willChange = prefersReducedMotion() ? '' : 'transform, opacity';
	nextPaint(() => {
		tab.dom.classList.remove('slide-out-left');
		tab.dom.classList.add('active-view');
	});
}

function hide(tab) {
	if (!tab?.dom) {
		return;
	}
	tab.dom.classList.remove('active-view');
	tab.dom.classList.add('slide-out-left');
	tab.dom.style.willChange = prefersReducedMotion() ? '' : 'transform, opacity';
}

export function slideIn(newTab, currentTab, viewport) {
	if (!newTab?.dom || !viewport) {
		return;
	}
	if (currentTab && currentTab !== newTab) {
		hide(currentTab);
	}
	attachOnce(viewport, newTab);
	show(newTab);
	setTimeout(() => {
		newTab.dom.style.willChange = '';
	}, cleanupDelay());
}

export function slideOut(leavingTab, returningTab, viewport) {
	if (leavingTab?.dom) {
		hide(leavingTab);
		setTimeout(() => {
			if (leavingTab.dom.parentNode === viewport) {
				viewport.removeChild(leavingTab.dom);
			}
			leavingTab.dom.style.willChange = '';
		}, cleanupDelay());
	}
	if (returningTab?.dom) {
		attachOnce(viewport, returningTab);
		show(returningTab);
		setTimeout(() => {
			returningTab.dom.style.willChange = '';
		}, cleanupDelay());
	}
}
