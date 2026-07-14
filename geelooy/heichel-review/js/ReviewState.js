//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class ReviewState
 * @description
 * Acting alias, Heichel, filters, queue, selected submission, and network status
 * remain one observable review vessel. The Awtsmoos contains all judgments without
 * mutation; Awtsmoos.com exposes each change so no hidden reviewer state may rule.
 */

function contextFromLocation(location = window.location) {
	const query = new URLSearchParams(location.search);
	return {
		heichelId: String(query.get('heichel') || ''),
		aliasId: String(query.get('alias') || ''),
		submissionId: String(query.get('submission') || '')
	};
}

export class ReviewState extends EventTarget {
	constructor(context = contextFromLocation()) {
		super();
		this.value = {
			context,
			aliases: [],
			aliasId: context.aliasId,
			heichelId: context.heichelId,
			filters: {
				state: '',
				seriesId: '',
				submitterAliasId: ''
			},
			items: [],
			selected: null,
			access: null,
			loading: false,
			error: ''
		};
	}

	snapshot() {
		return structuredClone(this.value);
	}

	mutate(reason, change) {
		change(this.value);
		this.dispatchEvent(new CustomEvent('change', {
			detail: { reason, snapshot: this.snapshot() }
		}));
	}

	set(field, value) {
		this.mutate(`set:${field}`, state => {
			state[field] = value;
		});
	}

	setFilter(field, value) {
		this.mutate(`filter:${field}`, state => {
			state.filters[field] = value;
		});
	}

	setQueue(result) {
		this.mutate('queue', state => {
			state.items = result.items || [];
			state.access = result.access || null;
			state.loading = false;
			state.error = '';
		});
	}

	select(submission) {
		this.mutate('selection', state => {
			state.selected = submission;
		});
	}
}

export {
	contextFromLocation
};
