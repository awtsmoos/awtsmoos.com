//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class MigrationStore
 * @description
 * The Awtsmoos keeps archive, server capability, validation, selection, and recovery in one canonical vessel;
 * Awtsmoos.com avoids shadow state so every visible migration instrument derives from the same evented truth.
 */
export class MigrationStore extends EventTarget {
	constructor() {
		super();
		this.state = {
			items: [],
			selectedIds: new Set(),
			destination: { aliasId: '', heichelId: '', seriesId: 'root' },
			filters: {
				query: '',
				provider: 'all',
				type: 'all',
				year: 'all',
				media: 'all',
				selection: 'all'
			},
			uploadedAssets: {},
			completed: {},
			failures: [],
			archive: null,
			archiveInfo: null,
			capabilities: null,
			preflight: null,
			stage: 'empty'
		};
	}

	snapshot() {
		return this.state;
	}

	mutate(reason, callback) {
		callback(this.state);
		this.dispatchEvent(new CustomEvent('change', {
			detail: { reason, state: this.state }
		}));
	}

	setCapabilities(capabilities) {
		this.mutate('server:capabilities', state => {
			state.capabilities = capabilities;
		});
	}

	setPreflight(preflight) {
		this.mutate('server:preflight', state => {
			state.preflight = preflight;
		});
	}

	setItems(items, archive, archiveInfo = null) {
		this.mutate('archive:parsed', state => {
			const available = new Set(items.map(item => item.id));
			state.items = items;
			state.archive = archive;
			state.archiveInfo = archiveInfo;
			state.selectedIds = new Set([...state.selectedIds].filter(id => available.has(id)));
			state.preflight = null;
			state.stage = 'review';
		});
	}

	toggle(id, selected) {
		this.mutate('selection', state => {
			if (selected) state.selectedIds.add(id);
			else state.selectedIds.delete(id);
			state.preflight = null;
		});
	}

	restore(checkpoint) {
		if (!checkpoint) return;
		this.mutate('checkpoint:restore', state => {
			state.selectedIds = new Set(checkpoint.selectedIds || []);
			state.destination = { ...state.destination, ...(checkpoint.destination || {}) };
			state.uploadedAssets = { ...(checkpoint.uploadedAssets || {}) };
			state.completed = { ...(checkpoint.completed || {}) };
			state.failures = [...(checkpoint.failures || [])];
		});
	}
}
