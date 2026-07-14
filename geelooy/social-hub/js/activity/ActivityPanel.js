//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class ActivityPanel
 * @description
 * The owner timeline loads, filters, shares, forgets, refreshes, and explains its
 * private-default contract. The Awtsmoos knows the road without a ledger while
 * Awtsmoos.com gives every retained step a visible and reversible sharing garment.
 */

import { activityCard } from './ActivityCard.js';

export class ActivityPanel {
	constructor({ root, api, state, status }) {
		Object.assign(this, { root, api, state, status });
		this.filter = 'all';
	}

	initialize() {
		this.element('activityRefresh').addEventListener('click', () => this.load(true));
		this.element('activityFilter').addEventListener('change', event => {
			this.filter = event.target.value;
			this.render(this.state.snapshot().activity);
		});
	}

	async load(announce = false) {
		const aliasId = this.state.snapshot().identity.aliasId;
		if (!aliasId) return;
		if (announce) this.status.show('Reading your private ledger…', 'working');
		try {
			const result = await this.api.activity(aliasId, 300);
			this.state.mutate('activity:loaded', value => {
				value.activity = result.events || [];
				value.preferences = result.preferences || value.preferences;
			});
			this.render(result.events || []);
			if (announce) this.status.show('Private activity refreshed.', 'success');
		} catch (error) {
			this.status.show(error.message, 'error');
		}
	}

	render(events = []) {
		const container = this.element('activityTimeline');
		container.replaceChildren();
		const filtered = this.filter === 'all'
			? events
			: events.filter(event => event.category === this.filter);
		this.element('activityCount').textContent = String(filtered.length);
		if (!filtered.length) {
			const empty = document.createElement('p');
			empty.className = 'emptyState';
			empty.textContent = 'No retained events match this view.';
			container.append(empty);
			return;
		}
		for (const event of filtered) {
			container.append(activityCard({
				document: this.root,
				event,
				onShare: (id, visibility) => this.share(id, visibility),
				onDelete: id => this.remove(id)
			}));
		}
	}

	async share(eventId, visibility) {
		const aliasId = this.state.snapshot().identity.aliasId;
		this.status.show('Saving event visibility…', 'working');
		try {
			await this.api.updateActivity(aliasId, eventId, { visibility });
			await this.load(false);
			this.status.show('Event sharing updated.', 'success');
		} catch (error) {
			this.status.show(error.message, 'error');
		}
	}

	async remove(eventId) {
		const aliasId = this.state.snapshot().identity.aliasId;
		this.status.show('Forgetting this event…', 'working');
		try {
			await this.api.deleteActivity(aliasId, eventId);
			await this.load(false);
			this.status.show('Event forgotten.', 'success');
		} catch (error) {
			this.status.show(error.message, 'error');
		}
	}

	element(id) {
		return this.root.getElementById(id);
	}
}
