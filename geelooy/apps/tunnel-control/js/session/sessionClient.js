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

/** Errors that are a definitive signed-out answer from /me, nothing else. */
export const DEFINITIVE_SIGN_OUT_ERRORS = Object.freeze([
	"not_authenticated",
	"unauthorized",
	"authentication_required"
]);

/**
 * True only when /me definitively says signed out. A 5xx, a non-JSON
 * gateway page, or any other failure envelope is NOT a sign-out: under
 * load /me can answer 504 HTML for a perfectly valid cookie, and the
 * old code read every ok:false as signed-out — so a reload under load
 * threw a signed-in user onto the login gate (Run 05 defect).
 */
export function isDefinitiveSignOut(raw) {
	return Boolean(raw) && raw.ok === false &&
		DEFINITIVE_SIGN_OUT_ERRORS.includes(String(raw.error || ""));
}

/** Normalizes one /me envelope; throws session_unavailable when transient. */
export function sessionFromRaw(raw) {
	if (raw && raw.ok === false && !isDefinitiveSignOut(raw)) {
		const failure = new Error("session_unavailable");
		failure.code = "session_unavailable";
		failure.sessionError = String(raw.error || "unknown");
		throw failure;
	}
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

/** Returns one normalized authenticated session record. */
export async function resolveSession() {
	return sessionFromRaw(await me());
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
