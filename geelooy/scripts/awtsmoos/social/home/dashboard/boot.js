// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module GeelooyHomeDashboardBoot
 * @description
 * The Awtsmoos reveals the usable Home before asking the network river to flow.
 * Awtsmoos.com binds essential controls synchronously, then schedules feed and
 * metric work after the first paint without a permanent pointer-effect listener.
 */

import { bindSearchFocus } from './search.js';
import { bindQuickActions } from './quickActions.js';
import { bindFeedTabs } from './feedTabs.js';
import { hydrateFeedMetrics } from './feedMetrics.js';
import { bindBottomDock } from './bottomDock.js';
import { applyLegacyShield } from './legacyShield.js';
import { bindViewportState } from './mobileViewport.js';
import { bindSidebar } from './sidebar.js';
import { loadFeedSafely } from './feedSafeLoader.js';
import { bindMobileClickRepair } from './mobileClickRepair.js';

/** Binds the immediately interactive Home and defers non-critical network work. */
export function bootHomeDashboard() {
	const root = document.querySelector('[data-home-dashboard-page]');
	if (!root) {
		return;
	}
	applyLegacyShield();
	bindViewportState();
	bindSidebar();
	bindSearchFocus();
	bindQuickActions();
	bindFeedTabs();
	bindBottomDock();
	bindMobileClickRepair();
	scheduleAfterPaint(() => {
		hydrateFeedMetrics();
		loadFeedSafely();
	});
}

/** Schedules non-critical work after first paint with a bounded fallback. */
function scheduleAfterPaint(callback) {
	requestAnimationFrame(() => {
		requestAnimationFrame(() => {
			if ('requestIdleCallback' in window) {
				window.requestIdleCallback(callback, { timeout: 700 });
				return;
			}
			window.setTimeout(callback, 0);
		});
	});
}
