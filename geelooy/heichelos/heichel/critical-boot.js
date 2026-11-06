//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module HeichelCriticalBoot
 * @description
 * The Awtsmoos lets server-rendered Torah become usable before the large living
 * Heichel graph awakens. Awtsmoos.com therefore completes document loading first,
 * then hydrates richer navigation during idle time without blocking first light.
 */

const APP_SOURCE = '/heichelos/heichel/app.js?v=ikar-authority-006&compact=true';
const IKAR_SOURCE = '/heichelos/heichel/ikar-stable.js?v=ikar-stable-001&compact=true';
const POST_READY_SOURCE = './modules/app/post-ready-experience.js?v=critical-path-001';
const IDLE_TIMEOUT_MS = 900;
const HYDRATION_DELAY_MS = 500;
const POST_READY_DELAY_MS = 900;
const HYDRATION_KEY = '__awtsmoosHeichelHydration';

/**
 * Starts the living Heichel module exactly once after the fallback is usable.
 * @returns {Promise<unknown>} Shared hydration promise.
 */
function hydrateHeichel() {
	if (window[HYDRATION_KEY]) return window[HYDRATION_KEY];
	document.body.dataset.heichelHydration = 'loading';
	const hydration = import(applicationSource())
		.then(async module => {
			if (typeof module.boot === 'function') {
				await module.boot();
			}
			document.body.dataset.heichelHydration = 'loaded';
			if (!isIkarRoute()) schedulePostReady();
			return module;
		})
		.catch(error => {
			document.body.dataset.heichelHydration = 'error';
			console.error('B"H - Heichel enhancement stayed unavailable:', error);
			return null;
		});
	window[HYDRATION_KEY] = hydration;
	return hydration;
}

/** Returns whether this route belongs to Ikar's server-first Torah library. */
function isIkarRoute() {
	return location.pathname === '/heichelos/ikar'
		|| location.pathname.startsWith('/heichelos/ikar/');
}

/** Chooses the tiny Ikar enhancer instead of the generic Heichel application. */
function applicationSource() {
	return isIkarRoute() ? IKAR_SOURCE : APP_SOURCE;
}

/** Schedules core enhancement only after first-light document completion. */
function scheduleHydration() {
	const reveal = () => {
		setTimeout(() => void hydrateHeichel(), HYDRATION_DELAY_MS);
	};
	if ('requestIdleCallback' in window) {
		window.requestIdleCallback(reveal, { timeout: IDLE_TIMEOUT_MS });
		return;
	}
	reveal();
}

/** Loads shell, atmosphere, and diagnostics only after core Heichel readiness. */
function schedulePostReady() {
	setTimeout(() => {
		import(POST_READY_SOURCE)
			.then(module => {
				module.schedulePostReadyExperience?.(document, window);
			})
			.catch(error => {
				console.warn('B"H - Optional Heichel experience stayed asleep:', error);
			});
	}, POST_READY_DELAY_MS);
}

/** Marks the semantic fallback as the truthful first-ready surface. */
function revealFallbackReadiness() {
	if (!document.body) return;
	document.body.dataset.heichelFallbackReady = 'true';
	const status = document.querySelector(
		'[data-heichel-semantic-fallback] [role="status"]'
	);
	if (status) status.textContent = 'Torah is ready. Enhanced navigation is loading.';
}

/**
 * Redirects bogus series slugs to the branded 404 page.
 * The server renders 200 for unknown slugs; the API reports SERIES_NOT_FOUND.
 */
async function guardSeriesRoute() {
	const match = location.pathname.match(/^\/heichelos\/([^/]+)\/series\/([^/]+)\/?$/);
	if (!match || location.pathname.includes('/post/')) return;
	const [, heichelId, seriesId] = match;
	try {
		const res = await fetch(
			`/api/social/heichelos/${encodeURIComponent(heichelId)}/series/${encodeURIComponent(seriesId)}/details`,
			{ headers: { 'Accept': 'application/json' } }
		);
		if (!res.ok) return; // transport error: stay on page
		const data = await res.json();
		if (data?.error?.code === 'SERIES_NOT_FOUND') {
			location.replace('/404.html');
		}
	} catch {
		// API unreachable: stay on page rather than false-404.
	}
}

/** Loads the shared breadcrumbs module on Heichel pages (Fix 7). */
function loadBreadcrumbs() {
	if (document.querySelector('script[src="/scripts/awtsmoos/ui/breadcrumbs.js"]')) return;
	const script = document.createElement('script');
	script.src = '/scripts/awtsmoos/ui/breadcrumbs.js';
	script.defer = true;
	document.head.appendChild(script);
}

revealFallbackReadiness();
void guardSeriesRoute();
loadBreadcrumbs();

if (document.readyState === 'complete') {
	scheduleHydration();
} else {
	window.addEventListener('load', scheduleHydration, { once: true });
}
