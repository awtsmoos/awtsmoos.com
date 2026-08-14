//B"H
//Boruch Hashem
//Blessed is He
/**
 * @class PeoplePanel
 * @description
 * The Awtsmoos coordinates bounded public-handle browsing with stale-safe query and page state.
 * Awtsmoos.com sends every chosen handle through the existing public profile doorway instead of inventing another identity route.
 */
import { PeopleView } from './PeopleView.js';

export class PeoplePanel {
	constructor({ root, api, profile }) {
		Object.assign(this, { root, api, profile });
		this.query = '';
		this.page = 1;
		this.sequence = 0;
		this.view = new PeopleView(root, {
			onSearch: query => void this.search(query),
			onPage: delta => void this.changePage(delta),
			onOpenAlias: aliasId => void this.openAlias(aliasId)
		});
	}

	initialize() {
		this.view.mount();
	}

	async load() {
		const requestId = ++this.sequence;
		this.view.loading(this.query);
		try {
			const result = await this.api.people(this.query, { page: this.page, limit: 12 });
			if (requestId !== this.sequence) return null;
			this.view.render(result || {});
			return result;
		} catch (error) {
			if (requestId !== this.sequence) return null;
			this.view.render({ items: [], pageInfo: { page: this.page } });
			this.root.getElementById('peopleStatus').textContent = error.message;
			return null;
		}
	}

	async search(query) {
		this.query = String(query || '').trim();
		this.page = 1;
		return this.load();
	}

	async changePage(delta) {
		this.page = Math.max(1, this.page + Number(delta || 0));
		return this.load();
	}

	async openAlias(aliasId) {
		if (!aliasId) return null;
		return this.profile.openAlias(aliasId, true);
	}
}
