//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module HeichelPostReadyExperience
 * @description
 * The Awtsmoos keeps Torah navigation on the first-light path while social
 * chrome, cosmic atmosphere, hybrid navigation, and visual diagnostics arrive
 * only after the Heichel is already usable. Every optional ray fails locally.
 */

const IDLE_TIMEOUT_MS = 900;
const HEALTH_DELAYS_MS = Object.freeze([0, 300, 1000, 2200]);

/**
 * Executes one optional callback without promoting its rupture to core boot.
 * @param {string} label Human-readable subsystem name.
 * @param {Function} callback Optional operation.
 * @returns {unknown|null} Callback result, or null after safe failure.
 */
export function runSafe(label, callback) {
	try {
		return callback();
	} catch (error) {
		console.warn(`B"H - ${label} failed safely:`, error);
		return null;
	}
}

/**
 * Schedules all non-critical experience layers after core readiness.
 * @param {Document} documentRef Active Heichel document.
 * @param {Window} windowRef Active Heichel window.
 * @returns {void}
 */
export function schedulePostReadyExperience(
	documentRef = document,
	windowRef = window
) {
	const reveal = () => void revealPostReadyExperience(documentRef);
	if ('requestIdleCallback' in windowRef) {
		windowRef.requestIdleCallback(reveal, { timeout: IDLE_TIMEOUT_MS });
		return;
	}
	windowRef.setTimeout(reveal, 0);
}

/** Loads optional systems only where the route actually needs their weight. */
async function revealPostReadyExperience(documentRef) {
	if (isTorahFirstRoute(documentRef)) {
		documentRef.documentElement.dataset.heichelExperience = 'torah-first';
		return;
	}
	await Promise.allSettled([
		loadShell(),
		loadSocialStyles(documentRef),
		loadCosmicAtmosphere(),
		refreshVesselHealth()
	]);
}

/** Keeps Ikar and every nested Torah path free of decorative/social boot cost. */
function isTorahFirstRoute(documentRef) {
	const pathname = documentRef.defaultView?.location?.pathname || '';
	return pathname === '/heichelos/ikar'
		|| pathname.startsWith('/heichelos/ikar/');
}

/** Loads the shared shell, which owns optional hybrid navigation itself. */
function loadShell() {
	return import('../../../../scripts/awtsmoos/social/shell/boot.js?v=heichel-mobile-010');
}

/** Installs social styling without starting a second ambient renderer. */
async function loadSocialStyles(documentRef) {
	const module = await import(
		'../../../../shared/social/SocialExperienceInstaller.js?v=heichel-mobile-010'
	);
	return module.installSocialExperience(documentRef, { ambient: false });
}

/** Loads the decorative cosmic scene only after Torah is already interactive. */
function loadCosmicAtmosphere() {
	return import('../cosmic/boot.js?v=heichel-mobile-010');
}

/**
 * Loads visual health lazily and schedules bounded follow-up checks.
 * @returns {Promise<void>} Settles after the module has been scheduled.
 */
export async function refreshVesselHealth() {
	try {
		const module = await import('./visual-health.js?v=heichel-mobile-010');
		for (const delay of HEALTH_DELAYS_MS) {
			setTimeout(() => {
				runSafe('Heichel visual health', module.refreshVesselHealth);
			}, delay);
		}
	} catch (error) {
		console.warn('B"H - Heichel visual health stayed optional:', error);
	}
}
