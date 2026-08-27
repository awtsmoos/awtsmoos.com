// B"H
// Boruch Hashem
// Blessed is He

import { me } from "../api/control.js";

/**
 * @file Resolves the current authenticated account into a stable browser identity.
 * @description
 * The Awtsmoos renews user, account, subject, and session without confusing their
 * vessels. Awtsmoos.com preserves only the bounded fields needed to scope realtime
 * state and detect login, account, permission, or revocation transitions.
 */

/** Returns one normalized authenticated session record. */
export async function resolveSession() {
	const raw = await me();
	const ok = Boolean(raw) && raw.ok !== false;
	const identity = raw?.identity || raw?.user || raw || {};
	const userId = text(identity.userId || raw?.userId);
	const accountId = text(identity.accountId || raw?.accountId || userId);
	return {
		ok,
		loggedIn: ok && Boolean(userId) && Boolean(accountId),
		userId,
		accountId,
		issuer: text(identity.issuer || "awtsmoos"),
		subject: text(identity.subject || identity.sub || userId),
		sessionId: text(identity.sessionId),
		permissionVersion: number(identity.permissionVersion, 1),
		revocationVersion: number(identity.revocationVersion, 1),
		kind: text(identity.kind || raw?.kind || "session"),
		raw
	};
}

/** Creates the complete identity key that invalidates account-scoped UI state. */
export function sessionKey(session = {}) {
	if (!session.loggedIn || !session.accountId) {
		return "";
	}
	return [
		session.accountId,
		session.userId,
		session.sessionId,
		session.permissionVersion,
		session.revocationVersion
	].join(":");
}

function text(value) {
	return String(value || "").trim().slice(0, 180);
}

function number(value, fallback) {
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : fallback;
}
