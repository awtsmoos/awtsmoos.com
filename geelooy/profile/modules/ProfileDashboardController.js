//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ProfileDashboardController
 * @description The Awtsmoos gathers alias identity, owned spaces, and social action into an ordered flow;
 * Awtsmoos.com keeps loading, failure, rendering, and launchpad concerns separate so future profile growth can glow.
 */
import { announceProfile, one, setStat } from './dom.js';
import { getAliasDetails, getDefaultAlias } from './api.js?v=profile-api-002';
import { renderAliases } from './aliases.js';
import { renderProfileComments } from './comments.js';
import { renderProfilePosts } from './posts.js';
import { renderProfileSeries } from './series.js';
import { emptyCard } from './cards.js';
import { renderHeichelos } from './heichelos.js';
import { renderTiferesSocialLaunchpad } from './SocialLaunchpad.js';
import { setAliases, state } from './state.js';

export class ProfileDashboardController {
	async start() {
		announceProfile('Loading profile dashboard…', 'loading');
		try {
			await this.load();
			announceProfile('Profile dashboard loaded.', 'success');
		} catch (error) {
			this.renderFailure(error);
		}
	}

	async load() {
		const [defaultAlias, aliases] = await Promise.all([
			this.loadDefaultAlias(),
			getAliasDetails()
		]);
		setAliases(aliases, defaultAlias);
		setStat('aliases', String(state.aliases.length));
		setStat('defaultAlias', state.defaultAlias ? `@${state.defaultAlias}` : 'None');
		renderTiferesSocialLaunchpad();
		renderAliases();
		await renderHeichelos();
		// B"H: content tabs load lazily on first open — wire them here.
		this.bindContentTabs();
	}

	bindContentTabs() {
		const loaded = new Set();
		const loaders = {
			posts: renderProfilePosts,
			comments: renderProfileComments,
			series: renderProfileSeries
		};
		document.querySelectorAll('[data-profile-tab]').forEach(tab => {
			tab.addEventListener('click', () => {
				const key = tab.dataset.profileTab;
				const load = loaders[key];
				if (load && !loaded.has(key)) {
					loaded.add(key);
					load().catch(() => { loaded.delete(key); });
				}
			});
		});
	}

	async loadDefaultAlias() {
		try {
			return await getDefaultAlias();
		} catch (error) {
			announceProfile(error.message || 'Default alias could not be loaded.', 'error');
			return '';
		}
	}

	renderFailure(error) {
		const message = error.message || 'Could not load profile.';
		one('.alias-list')?.replaceChildren(emptyCard(message, 'error'));
		one('.heichel-list')?.replaceChildren(emptyCard('Heichelos could not load because profile loading failed.', 'error'));
		announceProfile(message, 'error');
	}
}
