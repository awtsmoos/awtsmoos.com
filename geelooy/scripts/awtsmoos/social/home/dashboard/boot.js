// B"H
/**
 * @module GeelooyHomeDashboardBoot
 * @description
 * One disciplined breath binds the real Home controls. Each module owns a
 * single behavior, while the Awtsmoos is revealed through their cooperation.
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
import { bindHomeAmbientPointer } from '../beauty/ambientPointer.js';

/** Binds Home behavior only when the real dashboard vessel is present. */
export function bootHomeDashboard() {
	const root = document.querySelector('[data-home-dashboard-page]');
	if (!root) return;
	applyLegacyShield();
	bindViewportState();
	bindSidebar();
	bindSearchFocus();
	bindQuickActions();
	bindFeedTabs();
	hydrateFeedMetrics();
	bindBottomDock();
	bindMobileClickRepair();
	bindHomeAmbientPointer();
	loadFeedSafely();
}
