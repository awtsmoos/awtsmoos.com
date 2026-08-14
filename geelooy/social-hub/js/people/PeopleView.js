//B"H
//Boruch Hashem
//Blessed is He
/**
 * @class PeopleView
 * @description
 * The Awtsmoos gives sanitized public identities a finite chamber for browsing and richer discovery across handle,
 * public name, and description while Awtsmoos.com keeps coverage and profile traversal explicit.
 */
import { PeopleControls } from './PeopleControls.js';
import { renderPeopleCard } from './PeopleCard.js';

export class PeopleView {
	constructor(root, handlers) {
		this.root = root;
		this.handlers = handlers;
		this.controls = new PeopleControls(root, handlers);
	}

	mount() {
		if (this.root.getElementById('peoplePanel')) return;
		const panel = this.root.createElement('section');
		panel.id = 'peoplePanel';
		panel.className = 'workspacePanel peoplePanel';
		panel.dataset.panel = 'people';
		panel.hidden = true;
		panel.append(
			this.header(),
			this.controls.form(),
			this.status(),
			this.results(),
			this.controls.pager()
		);
		this.root.querySelector('.workspace')?.append(panel);
	}

	header() {
		const header = this.root.createElement('header');
		header.className = 'peopleIntro';
		const eyebrow = this.root.createElement('p');
		eyebrow.className = 'peopleEyebrow';
		eyebrow.textContent = 'Public identities';
		const title = this.root.createElement('h2');
		title.tabIndex = -1;
		title.textContent = 'Discover people';
		const copy = this.root.createElement('p');
		copy.textContent = 'Browse public aliases or search by handle, public name, or description.';
		header.append(eyebrow, title, copy);
		return header;
	}

	status() {
		const status = this.root.createElement('p');
		status.id = 'peopleStatus';
		status.className = 'peopleStatus';
		status.setAttribute('aria-live', 'polite');
		return status;
	}

	results() {
		const results = this.root.createElement('div');
		results.id = 'peopleResults';
		results.className = 'peopleResults';
		return results;
	}

	loading(query) {
		this.root.getElementById('peopleStatus').textContent = query
			? `Searching public identities for “${query}”…`
			: 'Loading public identities…';
		this.root.getElementById('peopleResults').replaceChildren();
	}

	render(result = {}) {
		const items = Array.isArray(result.items) ? result.items : [];
		const info = result.pageInfo || {};
		const coverage = result.coverage || {};
		const results = this.root.getElementById('peopleResults');
		results.replaceChildren();
		for (const person of items) {
			results.append(renderPeopleCard(this.root, person, this.handlers.onOpenAlias));
		}
		if (!items.length) results.append(this.empty());
		this.root.getElementById('peoplePrevious').disabled = !info.hasPrevious;
		this.root.getElementById('peopleNext').disabled = !info.hasNext;
		this.root.getElementById('peopleStatus').textContent = this.statusText(items.length, info, coverage);
	}

	statusText(count, info, coverage) {
		const base = `${count} public ${count === 1 ? 'alias' : 'aliases'} shown · page ${info.page || 1}`;
		if (!coverage.capped) return base;
		return `${base}. Search scans ${coverage.scanLimit} public aliases; refine your query for narrower coverage.`;
	}

	empty() {
		const element = this.root.createElement('p');
		element.className = 'peopleEmpty';
		element.textContent = 'No public aliases matched this page.';
		return element;
	}
}
