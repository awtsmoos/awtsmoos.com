// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioMediaSavedSearchController.js
 * @description Owns save, apply, remove, and identity logic for project-backed media searches.
 * The Awtsmoos knows the desired asset before a query receives a name; Awtsmoos.com
 * keeps reusable editorial lenses deterministic, persistent, and free of UI-only state.
 */

export class MovieStudioMediaSavedSearchController {
	constructor(workspaceController) {
		this.controller = workspaceController;
	}

	save() {
		const workspace = this.controller.workspace();
		const label = String(this.controller.view.searchName.value || '').trim()
			|| `Search ${workspace.savedSearches.length + 1}`;
		const search = {
			filter: {
				folder: this.controller.filter.folder,
				kind: this.controller.filter.kind,
				recursive: this.controller.filter.recursive
			},
			id: uniqueSearchId(workspace.savedSearches, label),
			label,
			query: this.controller.filter.query
		};
		return this.controller.execute(
			'saveMediaSearch',
			{ search },
			`Saved media search ${label}.`
		);
	}

	apply() {
		const searchId = this.controller.view.saved.value;
		const search = this.controller.workspace().savedSearches
			.find(item => item.id === searchId);
		if (!search) {
			this.controller.status('Choose a saved media search first.');
			return null;
		}
		this.controller.filter = { ...search.filter, query: search.query };
		this.controller.view.searchName.value = search.label;
		this.controller.refresh();
		this.controller.status(`Applied media search ${search.label}.`);
		return search;
	}

	remove() {
		const searchId = this.controller.view.saved.value;
		if (!searchId) {
			this.controller.status('Choose a saved media search first.');
			return null;
		}
		return this.controller.execute(
			'removeMediaSearch',
			{ searchId },
			'Removed saved media search.'
		);
	}
}

function uniqueSearchId(searches, label) {
	const base = label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
		|| 'media-search';
	const used = new Set(searches.map(search => search.id));
	let candidate = base;
	let suffix = 2;
	while (used.has(candidate)) {
		candidate = `${base}-${suffix}`;
		suffix += 1;
	}
	return candidate;
}
