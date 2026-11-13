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
import { renderProfilePosts } from './posts.js';
import { renderProfileSeries, loadSeriesForAlias } from './series.js';
import { renderProfileActivity } from './activity.js';
import { emptyCard } from './cards.js';
import { renderHeichelos } from './heichelos.js';
import { renderProfileReading } from './reading.js';
import { renderTiferesSocialLaunchpad } from './SocialLaunchpad.js';
import { bindTabs } from './tabs.js';
import { setAliases, state, readCachedAliases } from './state.js';

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
		// B"H social fix 18 (defect 2): the old code awaited
		// Promise.all([loadDefaultAlias(), getAliasDetails()]) — when the
		// alias-list API timed out (Fix 17 check: "Profile API timed out:
		// /api/social/aliases/details") the throw killed load(), start()
		// rendered the failure, and the posts — and the cached 500 —
		// never showed. Settle the two legs separately; when the alias
		// list fails, fall back to the last-known alias list saved by
		// state.js, so boot continues and the cached stat shows. Only
		// when there are no aliases at all (fresh + cached) does boot
		// fail, with the original API error preserved for renderFailure.
		const [defaultAliasResult, aliasesResult] = await Promise.allSettled([
			this.loadDefaultAlias(),
			getAliasDetails()
		]);
		const defaultAlias = defaultAliasResult.status === 'fulfilled' ? (defaultAliasResult.value || '') : '';
		let aliases = null;
		if (aliasesResult.status === 'fulfilled' && Array.isArray(aliasesResult.value) && aliasesResult.value.length) {
			aliases = aliasesResult.value;
		} else {
			aliases = readCachedAliases();
		}
		if (!aliases || !aliases.length) {
			const reason = aliasesResult.status === 'rejected' ? aliasesResult.reason : null;
			throw new Error((reason && reason.message) || 'No aliases available.');
		}
		setAliases(aliases, defaultAlias);
		// B"H social fix 3 (defect 6): pre-load the default Posts CONTENT
		// now (the aliases are in). Load the content only — never activate
		// the tab or .click() it. The Posts tab is already the active tab
		// in the HTML; if the user picked another tab during boot, their
		// choice stands and the Posts content is simply ready when they
		// return to it.
		let postsBoot = null;
		if (!this._tabsLoaded.has('posts')) {
			this._tabsLoaded.add('posts');
			postsBoot = TAB_LOADERS.posts();
			postsBoot.catch(() => { this._tabsLoaded.delete('posts'); });
		}
		this.personalizeHero();
		// B"H social fix 14 (defect 1): the stats loaders (comments /
		// series / followers, 3 loaders x 5-at-a-time = 15 concurrent
		// requests) used to fire at the same moment as the Posts
		// pre-load, so the profile booted ~25 concurrent slow
		// per-alias requests on a 2-CPU box and the slow /posts
		// aliases passed their 15s timeout, forcing the retry and
		// pushing the hero Posts stat to ~45s (Fix 13 check, reload
		// 2). The stats loaders now wait until the Posts pre-load
		// settles (both branches run them, so they still load if the
		// Posts load fails) — the Posts load, which gates the hero
		// stat, runs with only the Heichelos load competing. The
		// secondary stats appear a few seconds later; they are
		// best-effort and their template values (0) already match
		// this user's real counts.
		if (postsBoot) {
			postsBoot.then(
				() => this.loadStatsEagerly(),
				() => this.loadStatsEagerly()
			);
		} else {
			this.loadStatsEagerly();
		}
		try { renderTiferesSocialLaunchpad(); } catch { /* launchpad must never break boot */ }
		try { renderAliases(); } catch { /* aliases must never break boot */ }
		// B"H social fix 18 (defect 5): load() used to await
		// renderHeichelos() last, so the "Profile dashboard loaded."
		// announcement in start() only fired after the Heichelos list
		// finished — when it is slow, the status text stayed "Loading
		// profile dashboard…" long after the stats and posts had loaded.
		// Heichelos now loads in the background (like renderAliases):
		// the announcement fires once aliases + hero + posts boot are
		// done, and the Heichelos list still lands when it is ready.
		try { renderHeichelos().catch(() => {}); } catch { /* heichelos must never break boot */ }
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
			const [comments, series, followers] = await Promise.all([
				// B"H social fix 12 (defect 1): the hero Posts stat has ONE
				// writer now — renderProfilePosts, which writes the list's
				// own total at the end of its render. Fix 11 made both
				// writers count the same SET, but they still fetched the
				// same ~40 per-alias endpoints INDEPENDENTLY, so per-alias
				// failures/timeouts made their totals differ across runs
				// (0 → 321 → 500 in the Fix 11 rendered check). One writer
				// from one fetch means the stat is written once, from the
				// list's own data, and always agrees with the list.
				countAll(loadCommentsForAlias),
				countAll(loadSeriesForAlias),
				this.countFollowers(aliases)
			]);
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
			if (!primary) {
				// B"H social fix 16 (defect 4): no alias to show — reveal
				// anyway so the placeholder (or the signed-out card) appears
				// rather than staying hidden.
				document.querySelector('[data-profile]')?.classList.add('is-hero-resolved');
				return;
			}
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
			// B"H social fix 16 (defect 4): reveal the hero identity now
			// that it is filled. The template hides name/handle/avatar
			// until this runs, so the page never flashes "Your profile
			// @you".
			document.querySelector('[data-profile]')?.classList.add('is-hero-resolved');
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
