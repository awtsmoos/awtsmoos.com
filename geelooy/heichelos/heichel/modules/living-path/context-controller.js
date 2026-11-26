// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LivingPathContextController
 * @description
 * The Awtsmoos creates ancestry, memory, discovery, and custom study chambers as one truthful orientation;
 * Awtsmoos.com keeps navigation and follow-state distinct while the twelfth branch clears global chrome from dedicated Torah tools.
 */

import { appState } from '../state.js';
import { DOMElements } from '../dom.js';
import { applyCustomPageMode } from '../ui/custom-page-mode.js?v=heichel-mobile-012';
import { readProgress } from './progress-store.js';
import { LivingPathContextFollowController } from './context-follow-controller.js?v=heichel-mobile-010';
import { resolveHeichelAddAction } from './add-action.js?v=owner-upload-001';
import { renderPathSurfaces } from '../ui/render/living-path/path-renderer.js?v=heichel-mobile-010';
import {
	renderContinue,
	renderRelated,
	updateProfileContext
} from '../ui/render/living-path/discovery-renderer.js?v=heichel-mobile-010';

export class LivingPathContextController {
	constructor(navigator, gateway) {
		this.navigator = navigator;
		this.gateway = gateway;
		this.follow = new LivingPathContextFollowController();
	}

	afterLoad(content) {
		renderPathSurfaces(this.navigator, appState);
		renderContinue(readProgress(this.gateway, appState.heichelId));
		// B"H 2026-11-26 (owner-aware upload): every load re-aims the
		// hero add action at the series now on stage, in the visitor's
		// true state (owner / contributor / signed-out).
		void resolveHeichelAddAction();
		this.afterViewChange(content);
		applyCustomPageMode(appState.currentSeriesData);
		updateProfileContext(appState);
		void this.follow.sync();
	}

	afterViewChange(content = appState.currentContent) {
		renderRelated(content, this.navigator, appState.currentView);
		applyCustomPageMode(appState.currentSeriesData);
	}

	goParent() {
		const id = DOMElements.stickyParentButton?.dataset.seriesId;
		if (id) {
			void this.navigator.navigateTo(id);
		}
	}

	togglePathDetails() {
		if (!DOMElements.pathDetails) {
			return;
		}
		DOMElements.pathDetails.open = !DOMElements.pathDetails.open;
		if (DOMElements.pathDetails.open) {
			DOMElements.pathDetails.scrollIntoView({
				block: 'nearest'
			});
		}
	}

	profileDisclosureChanged(event) {
		appState.livingPath.profileDisclosureTouched = true;
		event.currentTarget.dataset.userOpened = String(event.currentTarget.open);
	}

	openHeichelMenu() {
		if (DOMElements.profileDetails) {
			DOMElements.profileDetails.open = true;
		}
		// The button used to do nothing beyond opening the very details
		// panel the action row lives in — no menu ever appeared. It now
		// toggles a real action menu anchored to the button.
		const trigger = document.querySelector(
			'button[aria-label="More Heichel actions"]'
		);
		toggleHeichelMenu(trigger);
	}

	toggleHeichelFollow() {
		return this.follow.toggleHeichel();
	}

	toggleCurrentSeriesFollow() {
		return this.follow.toggleSeries();
	}
}

const HEICHEL_MENU_ID = 'heichelProfileMenu';

function composerSeriesHref() {
	const parameters = new URLSearchParams({
		heichel: appState.heichelId,
		series: 'root',
		create: 'series'
	});
	if (window.curAlias) parameters.set('alias', window.curAlias);
	return `/social-composer/?${parameters}`;
}

function cockpitHref() {
	const parameters = new URLSearchParams({
		heichel: appState.heichelId,
		action: 'update'
	});
	if (window.curAlias) parameters.set('alias', window.curAlias);
	return `/heichelos/manage-alias-heichelos/?${parameters}`;
}

function closeHeichelMenu(trigger) {
	document.getElementById(HEICHEL_MENU_ID)?.remove();
	trigger?.setAttribute('aria-expanded', 'false');
}

function toggleHeichelMenu(trigger) {
	if (document.getElementById(HEICHEL_MENU_ID)) {
		closeHeichelMenu(trigger);
		return;
	}
	injectHeichelMenuStyle();
	const menu = document.createElement('div');
	menu.id = HEICHEL_MENU_ID;
	menu.className = 'heichel-profile-menu';
	menu.setAttribute('role', 'menu');

	const addItem = (label, action) => {
		const item = document.createElement('button');
		item.type = 'button';
		item.className = 'heichel-profile-menu-item';
		item.setAttribute('role', 'menuitem');
		item.textContent = label;
		item.addEventListener('click', () => {
			closeHeichelMenu(trigger);
			action();
		});
		menu.appendChild(item);
	};

	if (appState.ownsIt && appState.heichelId) {
		addItem('＋ New series', () => {
			window.location.href = composerSeriesHref();
		});
		addItem('⚙ Heichel settings', () => {
			import('../ui/heichel-settings.js')
				.then(({ openHeichelSettings }) => openHeichelSettings())
				.catch(() => { /* settings remain reachable via the floating owner entry */ });
		});
		addItem('Manage Heichel', () => {
			window.location.href = cockpitHref();
		});
	}
	addItem('Copy page link', () => {
		const url = window.location.href;
		if (navigator.clipboard?.writeText) {
			void navigator.clipboard.writeText(url).catch(() => {});
		}
	});

	document.body.appendChild(menu);
	trigger?.setAttribute('aria-expanded', 'true');
	if (trigger) {
		const rect = trigger.getBoundingClientRect();
		menu.style.top = `${Math.round(rect.bottom + 8)}px`;
		menu.style.right = `${Math.max(8, Math.round(window.innerWidth - rect.right))}px`;
	}
	const dismiss = event => {
		if (menu.contains(event.target) || event.target === trigger) return;
		closeHeichelMenu(trigger);
		document.removeEventListener('pointerdown', dismiss, true);
	};
	document.addEventListener('pointerdown', dismiss, true);
	menu.addEventListener('keydown', event => {
		if (event.key === 'Escape') closeHeichelMenu(trigger);
	});
	menu.querySelector('.heichel-profile-menu-item')?.focus();
}

function injectHeichelMenuStyle() {
	if (document.getElementById('heichelProfileMenuStyle')) return;
	const style = document.createElement('style');
	style.id = 'heichelProfileMenuStyle';
	style.textContent = `
		.heichel-profile-menu{position:fixed;z-index:1300;min-width:210px;padding:6px;border-radius:12px;border:1px solid rgba(255,255,255,.16);background:rgba(20,22,34,.97);color:#f2ead8;box-shadow:0 14px 40px rgba(0,0,0,.5);display:flex;flex-direction:column;gap:2px}
		.heichel-profile-menu-item{display:block;width:100%;text-align:left;padding:9px 12px;border:0;border-radius:8px;background:transparent;color:inherit;font:inherit;font-size:14px;cursor:pointer}
		.heichel-profile-menu-item:hover,.heichel-profile-menu-item:focus-visible{background:rgba(255,255,255,.09)}
	`;
	document.head.appendChild(style);
}
