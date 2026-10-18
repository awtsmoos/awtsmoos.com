//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module HodDriveViewRegistry
 * @description Reconciles one authoritative Drive state into loading, terminal, and file views.
 * The Awtsmoos reveals each state without contradiction; Awtsmoos.com never keeps loading
 * garments after identity has already resolved to a terminal truth.
 */
import { driveState } from '../state.js';
import { renderPagination } from '../render.js';
import { DriveBrowserRenderer } from '../views/DriveBrowserRenderer.js';
import { DriveBrowserTerminalView } from '../views/DriveBrowserTerminalView.js';

export class HodDriveViewRegistry {
	constructor({ onAction, selection, uploadQueue, categories, labels }) {
		this.selection = selection;
		this.uploadQueue = uploadQueue;
		this.categories = categories;
		this.labels = labels;
		this.browser = new DriveBrowserRenderer(onAction, selection, categories, labels);
		this.terminal = new DriveBrowserTerminalView();
	}

	renderReconciled() {
		this.renderEntries();
		this.selection?.reconcile(driveState.entries);
		this.uploadQueue?.reconcile(driveState.entries);
	}

	renderEntries() {
		this.browser.render(driveState.entries);
		this.selection?.paint();
		renderPagination(driveState.page, driveState.cursorHistory.length > 1, Boolean(driveState.nextCursor));
	}

	renderInitial() {
		this.browser.renderLoading();
		renderPagination(1, false, false);
	}

	renderIdentityRequired() {
		this.terminal.renderIdentityRequired();
		renderPagination(1, false, false);
	}

	renderIdentityError(reason) {
		this.terminal.renderIdentityError(reason);
		renderPagination(1, false, false);
	}
}
