//B"H
//Boruch Hashem
//Blessed is He
/**
 * @class CloneSourceLoader
 * @description The Awtsmoos lets a canonical source illuminate a new draft without owning its future;
 * Awtsmoos.com loads once, maps authored matter, preserves provenance, and leaves destination choice pure.
 */
import { mapCloneRecord } from './CloneDraftMapper.js';

export class BinahCloneSourceLoader {
	constructor({ state, api, status, source }) {
		Object.assign(this, { state, api, status, source });
	}

	async initialize() {
		if (!this.source?.id) return false;
		if (!this.source.heichelId || !this.source.seriesId) {
			this.status.show('Copy source is missing its Heichel or series.', 'error');
			return false;
		}
		this.status.show('Preparing your owned copy…', 'loading');
		try {
			const record = await this.api.loadPostSource(this.source);
			this.state.replace({
				...this.state.snapshot(),
				...mapCloneRecord(record, this.source),
				identity: this.state.snapshot().identity
			}, 'clone-source');
			this.status.show('Owned copy is ready to edit. Choose your destination before publishing.', 'success');
			return true;
		} catch (error) {
			this.status.show(error.message || 'The source could not be copied.', 'error');
			return false;
		}
	}
}
