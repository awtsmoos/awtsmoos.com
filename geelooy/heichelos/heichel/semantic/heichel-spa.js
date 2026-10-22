//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module HeichelSpa
 * @description
 * The Awtsmoos lets heichel and series browsing move without the page dying.
 * Awtsmoos.com intercepts heichel/series link clicks and swaps the semantic
 * fallback fragment client-side (no page reload). Only post views (/post/)
 * take a full page load, per the user's order.
 *
 * Rules:
 * - Same heichel, hydrated client shell awake -> delegate to the navigator.
 * - Same heichel, shell asleep/absent -> fetch the page HTML, swap the
 *   #heichel-semantic-fallback fragment, pushState.
 * - Other heichel -> same fragment swap; a stale shell is removed and its
 *   navigator retired so it can never fight history.
 * - Post URLs -> never intercepted; the browser navigates natively.
 */

const INSTALLED_KEY = '__awtsmoosHeichelSpaInstalled';
const FRAGMENT_SELECTOR = '#heichel-semantic-fallback';
const SHELL_SELECTOR = '[data-heichel-client-shell]';
const IKAR_FIRST_SRC = '/heichelos/heichel/ikar-first.js?v=ikar-first-004&persistent-geometry=true';
const CACHE_PREFIX = 'awtsmoos:spa-frag:';

if (!window[INSTALLED_KEY]) {
	window[INSTALLED_KEY] = true;
	installSpa();
}

function installSpa() {
	ensureProgressBar();
	document.addEventListener('click', onDocumentClick, true);
	window.addEventListener('popstate', onPopState);
	document.addEventListener('pointerover', onIntent, { passive: true });
	document.addEventListener('focusin', onIntent);
}

/** Parses /heichelos/<h>(/series/<s>)(?series=<s>)(?view=<v>) links. */
function parseHeichelRoute(value) {
	let u;
	try {
		u = value instanceof URL ? value : new URL(String(value), location.href);
	} catch (_) {
		return null;
	}
	const segs = u.pathname.split('/').filter(Boolean);
	if (segs[0] !== 'heichelos' || !segs[1]) return null;
	const heichelId = decodeURIComponent(segs[1]);
	const rest = segs.slice(2);
	let seriesId = u.searchParams.get('series');
	if (rest.length === 0) {
		// heichel root -> series root
	} else if (rest[0] === 'series') {
		seriesId = rest[1] ? decodeURIComponent(rest[1]) : null;
	} else {
		return null; // e.g. /submit -> not a browsable route
	}
	return {
		heichelId,
		seriesId: seriesId || 'root',
		view: u.searchParams.get('view') || 'posts'
	};
}

/** Canonical path form the server renders for every series page. */
function canonicalHref(route) {
	const base = '/heichelos/' + encodeURIComponent(route.heichelId);
	const path = route.seriesId && route.seriesId !== 'root'
		? base + '/series/' + encodeURIComponent(route.seriesId)
		: base + '/';
	const view = route.view && route.view !== 'posts' ? '?view=' + encodeURIComponent(route.view) : '';
	return path + view;
}

/** Post views always take a full page load, per the user's order. */
function isPostUrl(value) {
	try {
		const u = value instanceof URL ? value : new URL(String(value), location.href);
		return /\/post(\/|$)/.test(u.pathname);
	} catch (_) {
		return false;
	}
}

function anchorFromTarget(target) {
	return target && target.closest ? target.closest('a[href]') : null;
}

function shouldIntercept(link, event) {
	if (!link || event.defaultPrevented) return false;
	if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
	if (event.button !== undefined && event.button !== 0) return false;
	if (link.target || link.hasAttribute('download')) return false;
	if (link.dataset && link.dataset.nativeNavigation === 'true') return false;
	if (link.closest && link.closest('form')) return false;
	let dest;
	try {
		dest = new URL(link.href, location.href);
	} catch (_) {
		return false;
	}
	if (dest.origin !== location.origin) return false;
	if (dest.href === location.href) return false;
	if (dest.pathname === location.pathname && dest.search === location.search && dest.hash) return false;
	return true;
}

function currentHeichelId() {
	const segs = location.pathname.split('/').filter(Boolean);
	return segs[0] === 'heichelos' && segs[1] ? decodeURIComponent(segs[1]) : null;
}

let seenNavigator = null;
let seenNavigatorHeichel = null;

/** The heichel the live navigator was booted for (null when no shell). */
function navigatorHeichel() {
	const nav = window.__awtsmoosHeichelNavigator || null;
	if (!nav) {
		seenNavigator = null;
		seenNavigatorHeichel = null;
		return null;
	}
	if (nav !== seenNavigator) {
		seenNavigator = nav;
		seenNavigatorHeichel = currentHeichelId();
	}
	return seenNavigatorHeichel;
}

function onDocumentClick(event) {
	const link = anchorFromTarget(event.target);
	if (!shouldIntercept(link, event)) return;
	if (isPostUrl(link.href)) return; // post view = full page, per the user
	const route = parseHeichelRoute(link.href);
	if (!route) return;
	const navH = navigatorHeichel();
	if (navH && route.heichelId === navH) {
		// The hydrated shell owns same-heichel series travel.
		event.preventDefault();
		const nav = window.__awtsmoosHeichelNavigator;
		try {
			const r = nav.navigateTo(route.seriesId);
			if (r && typeof r.catch === 'function') r.catch(() => location.assign(link.href));
		} catch (_) {
			location.assign(link.href);
		}
		return;
	}
	event.preventDefault();
	if (navH && route.heichelId !== navH) retireStaleShell();
	void spaGo(canonicalHref(route), { push: true });
}

function onPopState() {
	const href = location.href;
	if (isPostUrl(href)) return;
	const route = parseHeichelRoute(href);
	if (!route) return;
	const navH = navigatorHeichel();
	if (navH && route.heichelId === navH) return; // shell owns same-heichel history
	void spaGo(canonicalHref(route), { push: false });
}

/** Removes a retired shell so it can never fight SPA history. */
function retireStaleShell() {
	const shell = document.querySelector(SHELL_SELECTOR);
	if (shell) shell.remove();
	try {
		window.__awtsmoosHeichelNavigator = null;
	} catch (_) {}
	seenNavigator = null;
	seenNavigatorHeichel = null;
}

/* ---------- fragment fetching + cache ---------- */

const fragmentCache = new Map();
const inflight = new Map();

function cacheKey(href) {
	const u = new URL(href, location.href);
	u.hash = '';
	return u.href;
}

async function getFragment(href) {
	const key = cacheKey(href);
	if (fragmentCache.has(key)) return fragmentCache.get(key);
	try {
		const raw = sessionStorage.getItem(CACHE_PREFIX + key);
		if (raw) {
			const rec = JSON.parse(raw);
			if (rec && rec.html) {
				fragmentCache.set(key, rec);
				return rec;
			}
		}
	} catch (_) {}
	if (inflight.has(key)) return inflight.get(key);
	const p = fetchFragment(href)
		.then(rec => {
			fragmentCache.set(key, rec);
			try {
				sessionStorage.setItem(CACHE_PREFIX + key, JSON.stringify(rec));
			} catch (_) {}
			return rec;
		})
		.finally(() => inflight.delete(key));
	inflight.set(key, p);
	return p;
}

async function fetchFragment(href) {
	const res = await fetch(href, {
		headers: { 'X-Awtsmoos-SPA': 'fragment' },
		credentials: 'same-origin'
	});
	if (!res.ok) throw new Error('fragment fetch failed: ' + res.status);
	const html = await res.text();
	const doc = new DOMParser().parseFromString(html, 'text/html');
	const node = doc.querySelector(FRAGMENT_SELECTOR);
	if (!node) throw new Error('no heichel fragment in response');
	const styles = Array.from(doc.querySelectorAll('link[rel="stylesheet"]'))
		.map(link => link.getAttribute('href'))
		.filter(Boolean);
	return { title: doc.title || '', html: node.outerHTML, styles };
}

/* ---------- stylesheet adoption (load-speed Lever 2) ---------- */

/** Every stylesheet URL the live document already covers, incl. bundle members. */
function coveredStylesheetUrls() {
	const covered = new Set();
	document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
		try {
			covered.add(new URL(link.href, location.href).href);
		} catch (_) {}
		const raw = link.getAttribute('href') || '';
		const q = raw.indexOf('bundle=');
		if (q !== -1) {
			try {
				const members = JSON.parse(decodeURIComponent(raw.slice(q + 7)));
				members.forEach(m => {
					try {
						covered.add(new URL(m, location.href).href);
					} catch (_) {}
				});
			} catch (_) {}
		}
	});
	return covered;
}

/**
 * Appends any destination stylesheets the live page lacks (idempotent by
 * absolute href incl. bundle membership; never removes existing links).
 * Resolves once every newly added sheet has loaded, or after a bounded
 * wait so slow CSS can never block navigation for long.
 */
function adoptStylesheets(hrefs) {
	if (!Array.isArray(hrefs) || !hrefs.length) return Promise.resolve();
	const covered = coveredStylesheetUrls();
	const added = [];
	hrefs.forEach(href => {
		let abs;
		try {
			abs = new URL(href, location.href).href;
		} catch (_) {
			return;
		}
		if (covered.has(abs)) return;
		covered.add(abs);
		const link = document.createElement('link');
		link.rel = 'stylesheet';
		link.href = abs;
		link.dataset.awtsmoosAdoptedStyle = 'true';
		document.head.appendChild(link);
		added.push(new Promise(resolve => {
			link.addEventListener('load', resolve, { once: true });
			link.addEventListener('error', resolve, { once: true });
		}));
	});
	if (!added.length) return Promise.resolve();
	const bounded = new Promise(resolve => setTimeout(resolve, 600));
	return Promise.race([Promise.all(added), bounded]);
}

/* ---------- navigation ---------- */

let navToken = 0;

async function spaGo(href, { push }) {
	const token = ++navToken;
	const current = document.querySelector(FRAGMENT_SELECTOR);
	if (current) current.setAttribute('aria-busy', 'true');
	setPending(true);
	let rec;
	try {
		rec = await getFragment(href);
	} catch (_) {
		setPending(false);
		location.assign(href);
		return;
	}
	if (token !== navToken) return; // superseded by a newer navigation
	const target = document.querySelector(FRAGMENT_SELECTOR);
	if (!target) {
		setPending(false);
		location.assign(href);
		return;
	}
	const tpl = document.createElement('template');
	tpl.innerHTML = rec.html;
	const node = tpl.content.querySelector(FRAGMENT_SELECTOR);
	if (!node) {
		setPending(false);
		location.assign(href);
		return;
	}
	try {
		await adoptStylesheets(rec.styles);
	} catch (_) {}
	if (token !== navToken) return; // superseded while styles loaded
	target.replaceWith(node);
	if (rec.title) document.title = rec.title;
	if (push) {
		try {
			history.replaceState(Object.assign({}, history.state, { scrollY: window.scrollY }), '');
		} catch (_) {}
		history.pushState({ awtsmoosSpa: true, scrollY: 0 }, '', href);
	}
	const restoreY = !push && history.state && typeof history.state.scrollY === 'number'
		? history.state.scrollY
		: 0;
	window.scrollTo(0, restoreY);
	enhanceFragment(node);
	setPending(false);
}

/** Mirrors the template's inline reveal script and re-arms Ikar enhancement. */
function enhanceFragment(node) {
	const path = location.pathname;
	const isIkarRoot = path === '/heichelos/ikar' || path === '/heichelos/ikar/';
	if (isIkarRoot) node.setAttribute('data-ikar-root', 'true');
	else node.removeAttribute('data-ikar-root');
	node.setAttribute('aria-busy', 'false');
	const heichelId = currentHeichelId();
	if (heichelId === 'ikar') {
		import(IKAR_FIRST_SRC)
			.then(mod => {
				if (mod && typeof mod.boot === 'function') mod.boot();
			})
			.catch(() => {});
	}
	window.dispatchEvent(
		new CustomEvent('awtsmoos:heichel-fragment', {
			detail: { url: location.href, heichelId }
		})
	);
}

/* ---------- hover prefetch ---------- */

function onIntent(event) {
	const link = anchorFromTarget(event.target);
	if (!shouldIntercept(link, {}) || isPostUrl(link.href)) return;
	const route = parseHeichelRoute(link.href);
	if (!route) return;
	const navH = navigatorHeichel();
	if (navH && route.heichelId === navH) return; // shell owns it
	const conn = navigator.connection;
	if (conn && (conn.saveData || conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g')) return;
	getFragment(canonicalHref(route)).catch(() => {});
}

/* ---------- pending indicator ---------- */

function ensureProgressBar() {
	if (document.getElementById('awtsmoos-spa-progress')) return;
	const style = document.createElement('style');
	style.textContent =
		'#awtsmoos-spa-progress{position:fixed;top:0;left:0;height:2px;width:0;z-index:2147483647;' +
		'background:linear-gradient(90deg,#e8b64c,#fff2c9);transition:width .25s ease,opacity .3s ease;' +
		'opacity:0;pointer-events:none}';
	const bar = document.createElement('div');
	bar.id = 'awtsmoos-spa-progress';
	bar.setAttribute('aria-hidden', 'true');
	document.documentElement.append(style, bar);
}

function setPending(on) {
	const bar = document.getElementById('awtsmoos-spa-progress');
	if (!bar) return;
	if (on) {
		bar.style.opacity = '1';
		bar.style.width = '0';
		requestAnimationFrame(() => {
			bar.style.width = '72%';
		});
	} else {
		bar.style.width = '100%';
		setTimeout(() => {
			bar.style.opacity = '0';
			bar.style.width = '0';
		}, 240);
	}
}
