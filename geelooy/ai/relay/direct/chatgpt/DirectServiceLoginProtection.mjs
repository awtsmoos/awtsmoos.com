//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file Establishes and preserves the exact Shared AI Shliach sentinel around browser work.
 * @description
 * Automatic cleanup is suspended before browser readiness so an already-authenticated
 * root target can never be mistaken for disposable agent output. The exact Shliach target
 * is then leased durably before watchdog cleanup resumes.
 */
export function ensureProtectedLoginSurface(service) {
	return withProtectedLogin(
		service,
		() => service.loginCoordinator.openForLoginOnce()
	);
}

/**
 * Suspends all automatic closers while one exact login target receives durable protection.
 * @param {object} service Direct service owning watchdog and protection state.
 * @param {Function} operation Browser operation returning target identity.
 * @returns {Promise<object>} Protected browser-surface testimony.
 */
export async function withProtectedLogin(service, operation) {
	service.tabWatchdog?.stop?.();
	service.tabProtector?.suspendClosures?.();
	try {
		const result = await operation();
		protectResult(service, result);
		return result;
	} finally {
		service.tabProtector?.resumeClosures?.();
		service.activateProtection();
	}
}

/** Applies a 24-hour host-visible lease to the exact Shliach target. */
function protectResult(service, result = {}) {
	if (!result.targetId) return false;
	return service.tabProtector?.protectTarget?.(result.targetId, {
		kind: "human_login",
		port: result.debugPort,
		ttlMs: 24 * 60 * 60 * 1000,
		surviveOwnerExit: true
	}) === true;
}
