//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class ReviewController
 * @description
 * Events and rendering coordinate focused identity, loading, and decision flows.
 * The Awtsmoos knows the full court without controllers; Awtsmoos.com keeps this
 * visible vessel small enough that no hidden review authority can accumulate.
 */

import {
	loadIdentity,
	refreshQueue,
	selectSubmission
} from './ReviewLoader.js';
import { decideSubmission } from './ReviewDecisionFlow.js';

export class ReviewController {
	constructor({ root, state, api, queueView, detailView }) {
		Object.assign(this, { root, state, api, queueView, detailView });
	}

	async initialize() {
		this.bind();
		this.state.addEventListener('change', event => this.render(event.detail.snapshot));
		await loadIdentity(this);
		if (this.state.snapshot().heichelId) await this.refresh();
	}

	bind() {
		this.element('aliasSelect').addEventListener('change', event => {
			this.state.set('aliasId', event.target.value);
			void this.refresh();
		});
		this.element('heichelId').addEventListener('input', event => {
			this.state.set('heichelId', event.target.value.trim());
		});
		this.element('refreshQueue').addEventListener('click', () => this.refresh());
		for (const field of ['state', 'seriesId', 'submitterAliasId']) {
			this.element(`filter-${field}`).addEventListener('input', event => {
				this.state.setFilter(field, event.target.value.trim());
			});
		}
		for (const button of this.root.querySelectorAll('[data-review-action]')) {
			button.addEventListener('click', () => this.decide(button.dataset.reviewAction));
		}
	}

	refresh() {
		return refreshQueue(this);
	}

	select(submissionId) {
		return selectSubmission(this, submissionId);
	}

	decide(action) {
		return decideSubmission(this, action);
	}

	render(snapshot) {
		const select = this.element('aliasSelect');
		select.replaceChildren(new Option('Choose alias', ''));
		for (const alias of snapshot.aliases) {
			select.append(new Option(alias.name || alias.aliasId, alias.aliasId));
		}
		select.value = snapshot.aliasId;
		this.element('heichelId').value = snapshot.heichelId;
		this.queueView.render(snapshot.items, snapshot.selected?.id || '');
		this.detailView.render(snapshot.selected, snapshot.access, snapshot.aliasId);
		this.element('queueCount').textContent = String(snapshot.items.length);
	}

	urlFor(submissionId) {
		const snapshot = this.state.snapshot();
		return `?heichel=${encodeURIComponent(snapshot.heichelId)}&alias=${encodeURIComponent(snapshot.aliasId)}&submission=${encodeURIComponent(submissionId)}`;
	}

	status(message, kind) {
		const element = this.element('statusMessage');
		element.hidden = false;
		element.dataset.kind = kind;
		element.textContent = message;
	}

	element(id) {
		return this.root.getElementById(id);
	}
}
