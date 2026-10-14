//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ProfileDashboardController
 * @description The Awtsmoos gathers alias identity, owned spaces, and social action into an ordered flow;
 * Awtsmoos.com keeps loading, failure, rendering, and launchpad concerns separate so future profile growth can glow.
 * B"H 2026-10-13: tabs bind FIRST (before any network) so they always work; stats load eagerly in background.
 */
import { announceProfile, one, setStat } from './dom.js';
import { getAliasDetails, getDefaultAlias } from './api.js';
import { renderAliases } from './aliases.js';
import { renderProfileComments, loadCommentsForAlias } from './comments.js';
import { renderProfilePosts, loadPostsForAlias } from './posts.js';
import { renderProfileSeries, loadSeriesForAlias } from './series.js';
import { renderProfileActivity } from './activity.js';
import { emptyCard } from './cards.js';
import { renderHeichelos } from './heichelos.js';
import { renderTiferesSocialLaunchpad } from './SocialLaunchpad.js';
import { bindTabs } from './tabs.js';
import { setAliases, state } from './state.js';

/** Tab keys with lazy content loaders. Loaded once per tab via the tabs module. */
const TAB_LOADERS = {
	posts: renderProfilePosts,
	activity: renderProfileActivity,
	comments: renderProfileComments,
	series: renderProfileSeries
};

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
		// B"H: tabs bind FIRST — before any network — so they always switch panels
		// and load content even if later boot steps fail.
		this.bindContentTabs();
		const [defaultAlias, aliases] = await Promise.all([
			this.loadDefaultAlias(),
			getAliasDetails()
		]);
		setAliases(aliases, defaultAlias);
		this.personalizeHero();
		// B"H: stats load eagerly in the background — real numbers, not 0s.
		this.loadStatsEagerly();
		try { renderTiferesSocialLaunchpad(); } catch { /* launchpad must never break boot */ }
		try { renderAliases(); } catch { /* aliases must never break boot */ }
		try { await renderHeichelos(); } catch { /* heichelos must never break boot */ }
	}

	/**
	 * Binds tab switching + one-time lazy content loading through the single tabs module.
	 * Safe to call once; the tabs module guards against double-binding.
	 */
	bindContentTabs() {
		const loaded = new Set();
		bindTabs({
			onActivate: (key) => {
				const load = TAB_LOADERS[key];
				if (load && !loaded.has(key)) {
					loaded.add(key);
					load().catch(() => { loaded.delete(key); });
				}
			}
		});
	}

	/**
	 * Fetches real post/comment/series counts in the background so hero stats
	 * show true numbers without waiting for tab clicks. Never throws, never blocks.
	 */
	async loadStatsEagerly() {
		const aliases = state.aliases;
		if (!aliases.length) return;
		const STAT_TIMEOUT_MS = 10000;
		const countAll = async (loader) => {
			try {
				const groups = await Promise.race([
					Promise.all(aliases.map(loader)),
					new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), STAT_TIMEOUT_MS))
				]);
				return groups.flat().length;
			} catch {
				return null;
			}
		};
		try {
			const [posts, comments, series] = await Promise.all([
				countAll(loadPostsForAlias),
				countAll(loadCommentsForAlias),
				countAll(loadSeriesForAlias)
			]);
			if (posts != null) setStat('posts', String(posts));
			if (comments != null) setStat('comments', String(comments));
			if (series != null) setStat('series', String(series));
		} catch { /* stats are best-effort; tabs set them on load too */ }
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
