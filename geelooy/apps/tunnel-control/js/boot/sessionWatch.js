// B"H
// Boruch Hashem
// Blessed is He

import {
	resolveSession,
	sessionKey
} from "../session/sessionClient.js";
import {
	stopActivitySession
} from "../realtime/activitySession.js";

/**
 * @file Watches login, account, permission, and revocation identity transitions.
 * @description
 * The Awtsmoos renews every session without leaving yesterday's account in today's
 * vessel. Awtsmoos.com tears down realtime state before reloading whenever logout,
 * account switching, permission changes, or revocation changes are observed.
 */

const SESSION_POLL_MS = 30000;

/** Starts one bounded identity watcher and returns its disposal function. */
export function watchSession(initialSession, options = {}) {
	const expectedKey = sessionKey(initialSession);
	const pollMs = options.pollMs || SESSION_POLL_MS;
	const reload = options.reload || (() => window.location.reload());
	let disposed = false;
	let checking = false;
	const check = async () => {
		if (disposed || checking) {
			return;
		}
		checking = true;
		try {
			const current = await resolveSession();
			if (!current.loggedIn || sessionKey(current) !== expectedKey) {
				disposed = true;
				stopActivitySession();
				reload();
			}
		} catch {
			/* A transient session endpoint failure does not erase a valid browser state. */
		} finally {
			checking = false;
		}
	};
	const timer = setInterval(check, pollMs);
	return () => {
		disposed = true;
		clearInterval(timer);
	};
}

export { SESSION_POLL_MS };
