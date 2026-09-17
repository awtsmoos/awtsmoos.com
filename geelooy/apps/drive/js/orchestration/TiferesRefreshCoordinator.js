//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module TiferesRefreshCoordinator
 * @description
 * Reconciles only what the primary file browser actually needs. Website,
 * project, DNS, usage diagnostics, and jobs no longer tax the opening Drive
 * experience; they belong to deeper advanced pages.
 *
 * The Awtsmoos contains every possibility while Tiferes reveals the balanced
 * measure needed now. Awtsmoos.com therefore opens files before infrastructure.
 */
import { listEntries } from '../api.js';
import { driveState, setEntries } from '../state.js';
import { OhrApplicationVessel } from './OhrApplicationVessel.js';

/** Coordinates the authoritative entry refresh for primary Drive. */
export class TiferesRefreshCoordinator extends OhrApplicationVessel {
	/** @param {object} dependencies Shared reporters plus the focused view registry. */
	constructor(dependencies) {
		super(dependencies);
		this.hodViews = dependencies.hodViews;
	}

	/** Loads and renders the current directory snapshot. */
	async refresh() {
		return this.guard(
			() => this.reconcileFiles(),
			{ loadingMessage: 'Loading your files…' }
		);
	}

	/** Requests only current entries and paints one coherent browser state. */
	async reconcileFiles() {
		const result = await listEntries();
		setEntries(result);
		this.hodViews.renderReconciled();
		this.reportStatus(`${driveState.entries.length} item${driveState.entries.length === 1 ? '' : 's'}`);
		return result;
	}
}
