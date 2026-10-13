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
		this.personalizeHero();
		renderTiferesSocialLaunchpad();
		renderAliases();
		await renderHeichelos();
		// B"H: content tabs load lazily on first open — wire them here.
		this.bindContentTabs();
	}

	/** Fills the hero with the default alias identity (name, handle, avatar letter). */
	personalizeHero() {
		try {
			const primary = state.aliases.find(a => a.default) || state.aliases[0];
			if (!primary) return;
			const handle = document.querySelector('[data-profile-handle]');
			if (handle) handle.textContent = `@${primary.id}`;
			const name = document.querySelector('[data-profile-name]');
			const display = (primary.displayName || primary.name || primary.id || '').trim();
			if (name && display) name.textContent = display;
			const avatar = document.querySelector('[data-profile-avatar]');
			if (avatar) avatar.textContent = display.slice(0, 1).toUpperCase() || 'א';
			const bio = document.querySelector('[data-profile-bio]');
			const bioText = (primary.bio || primary.description || '').trim();
			if (bio && bioText) {
				bio.textContent = bioText;
				bio.hidden = false;
			}
		} catch { /* hero personalization must never break boot */ }
	}

	/** Signed-out visitors get the elegant sign-in card instead of a dead loader. */
	showSignedOut() {
		try {
			document.querySelector('[data-profile]')?.classList.add('is-signed-out');
			const panel = document.querySelector('[data-profile-signedout]');
			if (panel) panel.hidden = false;
			announceProfile('You are not signed in.', 'info');
		} catch { /* never throw from the failure path */ }
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
		if (/not logged in|sign in/i.test(message)) {
			this.showSignedOut();
			return;
		}
		one('.alias-list')?.replaceChildren(emptyCard(message, 'error'));
		one('.heichel-list')?.replaceChildren(emptyCard('Heichelos could not load because profile loading failed.', 'error'));
		announceProfile(message, 'error');
	}
}
