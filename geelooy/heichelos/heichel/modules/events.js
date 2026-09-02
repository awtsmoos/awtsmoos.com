// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module NerveCenter
 * @description
 * The Awtsmoos binds each global nerve once and gives every optional tool a lawful vessel;
 * Awtsmoos.com mounts Advanced inside the main stage so mobile reading stays uncovered and level.
 */

import { DOMElements } from './dom.js';
import { appState } from './state.js';

const EVENT_KEY = '__awtsmoosHeichelEventsBound';
let popstateNavigator = null;

export function initializeEventListeners(navigator) {
	popstateNavigator = navigator;
	if (window[EVENT_KEY]) return;
	window[EVENT_KEY] = true;
	import('./modal.js').then(module => module.initializeModal());
	window.addEventListener('popstate', handlePopState, { passive: true });
	setupSidebarHoverRituals();
	mountNotificationPanelOnce();
	mountPlatformPanelOnce();
}

function handlePopState() {
	if (!popstateNavigator) return;
	const params = new URLSearchParams(window.location.search);
	popstateNavigator.currentView = params.get('view') || 'posts';
	popstateNavigator.loadContent(params.get('series') || seriesFromPath() || 'root');
}

function seriesFromPath() {
	const segments = window.location.pathname.split('/').filter(Boolean);
	const index = segments.indexOf('series');
	return index === -1 ? null : decodeURIComponent(segments[index + 1] || '');
}

function setupSidebarHoverRituals() {
	if (!DOMElements.editorsSection || DOMElements.editorsSection.dataset.awtsmoosHoverBound === 'true') return;
	DOMElements.editorsSection.dataset.awtsmoosHoverBound = 'true';
	DOMElements.editorsSection.addEventListener('click', () => {
		DOMElements.editorHolder?.classList.toggle('extended');
	});
}

function mountNotificationPanelOnce() {
	if (!window.curAlias || window.__awtsmoosNotificationsMounted) return;
	window.__awtsmoosNotificationsMounted = true;
	import('./ui/notificationsPanel.js').then(module => {
		module.mountNotificationsPanel({ root: document.body, aliasId: window.curAlias });
	});
}

function mountPlatformPanelOnce() {
	if (window.__awtsmoosPlatformPanelMounted) return;
	window.__awtsmoosPlatformPanelMounted = true;
	import('./ui/platformPanel.js?v=heichel-mobile-007').then(module => {
		const root = document.querySelector('.geelooy-main-stage') || document.body;
		module.mountPlatformPanel({
			root,
			heichelId: appState.heichelId,
			aliasId: window.curAlias || ''
		});
	});
}
