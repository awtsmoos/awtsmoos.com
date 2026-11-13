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
import { getAliasDetails, getDefaultAlias, mapLimit } from './api.js';
import { listFollowers } from '/scripts/awtsmoos/social/profile/api.js';
import { renderAliases } from './aliases.js';
import { renderProfileComments, loadCommentsForAlias } from './comments.js';
import { renderProfilePosts, loadPostsForAlias } from './posts.js';
import { renderProfileSeries, loadSeriesForAlias } from './series.js';
import { renderProfileActivity } from './activity.js';
import { emptyCard } from './cards.js';
import { renderHeichelos } from './heichelos.js';
import { renderProfileReading } from './reading.js';
import { renderTiferesSocialLaunchpad } from './SocialLaunchpad.js';
import { bindTabs } from './tabs.js';
import { setAliases, state } from './state.js';

/**
 * The shell session's alias, or "" when the shell has no signed-in
 * session. Placeholder visitor values do not count as a session.
 */
function shellSessionAlias() {
	const value = String(window.curAlias || '').trim();
	if (!value) return '';
	return ['seeker', 'anonymous', 'guest'].includes(value.toLowerCase()) ? '' : value;
}

/** Tab keys with lazy content loaders. Loaded once per tab via the tabs module. */
const TAB_LOADERS = {
	posts: renderProfilePosts,
	activity: renderProfileActivity,
	comments: renderProfileComments,
	series: renderProfileSeries,
	// B"H social fix 3 (defect 7): Reading was never in this map — its
	// content loaded only from a separate inline-script click binding in
	// index.html, which never fired when the tab click did not reach the
	// button (defect 6). It now loads through the same onActivate path
	// as every other tab, on any activation (click, Enter, keyboard).
	reading: renderProfileReading
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
		// B"H social fix 3 (defect 6): pre-load the default Posts CONTENT
		// now (the aliases are in). Load the content only — never activate
		// the tab or .click() it. The Posts tab is already the active tab
		// in the HTML; if the user picked another tab during boot, their
		// choice stands and the Posts content is simply ready when they
		// return to it.
		if (!this._tabsLoaded.has('posts')) {
			this._tabsLoaded.add('posts');
			TAB_LOADERS.posts().catch(() => { this._tabsLoaded.delete('posts'); });
		}
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
		// B"H social fix 3 (defect 6): the loaded set lives on the
		// instance so load() can pre-load the Posts content above without
		// going through a click; onActivate still runs each loader once.
		if (!this._tabsLoaded) this._tabsLoaded = new Set();
		const loaded = this._tabsLoaded;
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
		// B"H social fix 1: the stats loaders fired one request per alias at once
		// (~40 per loader x 4 loaders = ~160 concurrent calls) alongside the
		// Heichelos load, which queued past the timeouts. They now run 5 at a
		// time, and the deadline is 30s so a slow batch still counts.
		const STAT_TIMEOUT_MS = 30000;
		const countAll = async (loader) => {
			try {
				const groups = await Promise.race([
					mapLimit(aliases, 5, loader),
					new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), STAT_TIMEOUT_MS))
				]);
				return groups.flat().length;
			} catch {
				return null;
			}
		};
		try {
			const [posts, comments, series, followers] = await Promise.all([
				countAll(loadPostsForAlias),
				countAll(loadCommentsForAlias),
				countAll(loadSeriesForAlias),
				this.countFollowers(aliases)
			]);
			if (posts != null) setStat('posts', String(posts));
			if (comments != null) setStat('comments', String(comments));
			if (series != null) setStat('series', String(series));
			if (followers != null) setStat('followers', String(followers));
		} catch { /* stats are best-effort; tabs set them on load too */ }
	}

	/**
	 * Counts followers across every alias from the same follow store the
	 * rest of the site reads. Returns null when the read fails so the
	 * stat keeps its previous value instead of inventing a number.
	 */
	async countFollowers(aliases) {
		try {
			const lists = await mapLimit(aliases, 5, async (alias) => {
				const followers = await listFollowers('alias', alias.id);
				return Array.isArray(followers) ? followers.length : 0;
			});
			return lists.reduce((sum, n) => sum + n, 0);
		} catch {
			return null;
		}
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
		// The page header's session comes from the shell's single alias
		// source (window.curAlias). A load failure whose text merely
		// mentions signing in must not flip this page to the signed-out
		// card while that source still shows a signed-in alias — only a
		// genuinely session-less visit gets the sign-in card; a signed-in
		// visitor gets the honest error instead.
		if (/not logged in|sign in/i.test(message) && !shellSessionAlias()) {
			this.showSignedOut();
			return;
		}
		one('.alias-list')?.replaceChildren(emptyCard(message, 'error'));
		one('.heichel-list')?.replaceChildren(emptyCard('Heichelos could not load because profile loading failed.', 'error'));
		announceProfile(message, 'error');
	}
}
