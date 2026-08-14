//B"H
//Boruch Hashem
//Blessed is He
/**
 * @class SpacesPanel
 * @description
 * The Awtsmoos lets discovery, channels, activity, review, member governance, and browser memory share one current;
 * Awtsmoos.com keeps alias, Heichel, series, canonical posts, moderation, and hierarchy synchronized without duplicating truth.
 */
import { isCurrentSpaceRoute, spaceRouteUrl } from '../navigation/SpaceRouteState.js';
import { ChannelActivityPanel } from './ChannelActivityPanel.js';
import { MemberGovernancePanel } from './MemberGovernancePanel.js';
import { ReviewQueuePanel } from './ReviewQueuePanel.js';
import { SpacesView } from './SpacesView.js';

export class SpacesPanel {
	constructor({ root, state, api, status }) {
		Object.assign(this, { root, state, api, status });
		this.view = new SpacesView(root);
		this.activity = new ChannelActivityPanel({ root, api });
		this.members = new MemberGovernancePanel({ root, state, api });
		this.review = new ReviewQueuePanel({ root, state, api });
		this.searchTimer = null;
		this.openSequence = 0;
	}

	/** Creates the route surface and binds debounced community search. */
	initialize() {
		const panel = this.view.ensurePanel();
		const form = panel.querySelector('.spacesSearch');
		const input = panel.querySelector('#spacesSearchInput');
		form?.addEventListener('submit', event => {
			event.preventDefault();
			void this.load(input?.value || '');
		});
		input?.addEventListener('input', event => this.queueSearch(event.target.value));
		this.view.message('spaceDetail', 'Choose a community to open its channel tree.');
	}

	/** Loads communities for the currently selected alias. */
	async load(query = '') {
		const aliasId = this.state.snapshot().identity?.aliasId;
		if (!aliasId) {
			this.view.message('spacesResults', 'Choose an alias above to discover communities.');
			return;
		}
		this.view.message('spacesResults', 'Loading live communities…');
		try {
			const destinations = await this.api.destinationApi.list(aliasId, query.trim());
			if (!destinations.length) {
				this.view.message('spacesResults', 'No matching communities yet. Create one in Composer.');
				return;
			}
			this.view.destinations(destinations, (heichelId, seriesId) => {
				void this.open(heichelId, seriesId);
			});
		} catch (error) {
			this.view.message('spacesResults', error.message || 'Community discovery is unavailable.');
		}
	}

	/** Opens one channel, then hydrates public and capability-gated community surfaces independently. */
	async open(heichelId, seriesId = 'root', options = {}) {
		const aliasId = this.state.snapshot().identity?.aliasId;
		if (!aliasId || !heichelId) return;
		const requestId = ++this.openSequence;
		if (options.writeHistory !== false && !isCurrentSpaceRoute(heichelId, seriesId)) {
			history.pushState(null, '', spaceRouteUrl(heichelId, seriesId));
		}
		this.view.message('spaceDetail', 'Opening community channel…');
		try {
			const detail = await this.api.destinationApi.detail(aliasId, heichelId, seriesId);
			if (requestId !== this.openSequence) return;
			this.view.detail(detail, (nextHeichel, nextSeries) => {
				void this.open(nextHeichel, nextSeries);
			});
			const context = {
				heichelId: detail.heichel.heichelId,
				seriesId: detail.series.seriesId || seriesId || 'root'
			};
			void this.activity.load(context);
			void this.members.load(context);
			void this.review.load(context);
		} catch (error) {
			this.view.message('spaceDetail', error.message || 'This community channel could not be opened.');
		}
	}

	/** Restores one Space coordinate from browser history without mutating history again. */
	async restore(space = {}) {
		if (!space.heichelId) {
			this.view.message('spaceDetail', 'Choose a community to open its channel tree.');
			return;
		}
		await this.open(space.heichelId, space.seriesId || 'root', { writeHistory: false });
	}

	queueSearch(value) {
		clearTimeout(this.searchTimer);
		this.searchTimer = setTimeout(() => {
			void this.load(value);
		}, 180);
	}
}
