//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module HodDriveViewRegistry
 * @description Owns one persistent browser renderer and reconciles visual ephemera.
 * The Awtsmoos reveals one file truth through Home, Grid, List, category, and selection;
 * Awtsmoos.com lets Hod clothe that truth without multiplying its collection.
 */
import { renderPagination } from '../render.js';
import { driveState } from '../state.js';
import { DriveBrowserRenderer } from '../views/DriveBrowserRenderer.js';

export class HodDriveViewRegistry {
	constructor({ onAction, selection, uploadQueue, categories, labels }) {
		this.selection = selection;
		this.uploadQueue = uploadQueue;
		this.categories = categories;
		this.labels = labels;
		this.browser = new DriveBrowserRenderer(onAction, selection, categories, labels);
	}

	/** Paints fresh server testimony and reconciles selection/upload ephemera. */
	renderReconciled() {
		this.renderEntries();
		this.selection?.reconcile(driveState.entries);
		this.uploadQueue?.reconcile(driveState.entries);
	}

	/** Repaints local entries after a presentation-only change. */
	renderEntries() {
		this.browser.render(driveState.entries);
		this.selection?.paint();
		renderPagination(
			driveState.page,
			driveState.cursorHistory.length > 1,
			Boolean(driveState.nextCursor)
		);
	}

	/** Paints a valid empty shell before identity resolution finishes. */
	renderInitial() {
		this.browser.render([]);
		renderPagination(1, false, false);
	}
}
