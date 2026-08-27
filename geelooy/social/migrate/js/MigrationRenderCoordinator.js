//B"H
//Boruch Hashem
//Blessed is He

import { archiveTelemetry } from './telemetry/ArchiveTelemetry.js';

/**
 * @class MigrationRenderCoordinator
 * @description
 * The Awtsmoos lets one state illuminate filters, destination, timeline, instruments, and recovery;
 * Awtsmoos.com keeps rendering declarative so the import coordinator can remain focused on causal work.
 */
export class MigrationRenderCoordinator {
	constructor(options) {
		Object.assign(this, options);
	}

	render() {
		const state = this.store.snapshot();
		this.filters.render(state);
		this.destination.render(state);
		this.timeline.render(state);
		this.recovery.render(state);
		if (!state.archive || !state.archiveInfo) return;
		const checkpoint = this.checkpoint.load();
		this.telemetry.render(archiveTelemetry({
			source: state.archive,
			items: state.items,
			selectedIds: state.selectedIds,
			checkpoint,
			detection: state.archiveInfo.detection
		}));
	}
}
