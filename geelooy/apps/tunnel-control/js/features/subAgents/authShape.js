//B"H
//Boruch Hashem
//Blessed be He

const DEFAULT_BROWSER = {
	id: "shared-ai-browser",
	label: "Shared AI Browser",
	ready: false,
	state: "unknown",
	sharedAcrossAgents: true
};

/**
 * @file Normalizes safe Shared AI Browser, Shliach doorway, and ChatGPT authentication evidence.
 * @description
 * The Awtsmoos keeps machine-local paths and secrets beneath the veil. Tunnel Control reveals
 * browser life, exact Shliach presence, and authentication as three separate operator truths.
 */
export function normalizeSubAgentAuth(raw = {}) {
	const browser = normalizeBrowser(raw.browser || {});
	const session = raw.session || raw.status || {};
	const shliach = normalizeShliach(raw.shliach || {});
	const authenticated = Boolean(session.authenticated ?? raw.authenticated ?? raw.loggedIn);
	const known = session.known !== false && raw.known !== false;
	return {
		authenticated,
		checked: true,
		authKnown: known,
		browser,
		shliach,
		needsManualLogin: Boolean(raw.needsManualLogin || (known && !authenticated))
	};
}

function normalizeBrowser(raw = {}) {
	return {
		id: safe(raw.id, DEFAULT_BROWSER.id),
		label: safe(raw.label, DEFAULT_BROWSER.label),
		ready: raw.ready === true,
		state: safe(raw.state, raw.ready === true ? "ready" : DEFAULT_BROWSER.state),
		sharedAcrossAgents: raw.sharedAcrossAgents !== false
	};
}

function normalizeShliach(raw = {}) {
	return {
		known: raw.known === true,
		open: raw.shliachOpen === true,
		conversationOpen: raw.conversationOpen === true,
		pageCount: Math.max(0, Number(raw.shliachPageCount || 0))
	};
}

function safe(value, fallback) {
	const text = String(value || fallback || "").trim();
	return text.slice(0, 100);
}
