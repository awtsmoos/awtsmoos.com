// B"H
/** @module SocialHubState */

/**
 * The acting alias is the visitor's own signed-in identity, taken from
 * the shell's single session source (window.curAlias, set on sign-in
 * and cleared on sign-out). It is deliberately NOT read from this
 * page's own local storage: a remembered Observatory alias outlives
 * sign-out, which once left a signed-out visitor "acting" as a real
 * user, presence badge and all. Signed out means no acting alias.
 */
export function sessionAlias() {
	const value = String(globalThis.window?.curAlias || "").trim();
	if (!value) return "";
	return ["seeker", "anonymous", "guest"].includes(value.toLowerCase()) ? "" : value;
}

export const state = {
    alias: sessionAlias(),
    targetAlias: localStorage.getItem("BH_SOCIAL_HUB_TARGET_ALIAS") || "ikar",
    heichelId: localStorage.getItem("BH_SOCIAL_HUB_HEICHEL") || "ikar",
    seriesId: localStorage.getItem("BH_SOCIAL_HUB_SERIES") || "root",
    query: "",
    active: "overview",
    results: {},
    busy: false,
    error: ""
};

/**
 * Adopts the shell session alias when the shell finished booting
 * after this module was first evaluated, and drops it again when the
 * session is gone. Never invents one.
 */
export function reconcileSessionAlias() {
	state.alias = sessionAlias();
	return state.alias;
}

export function setField(key, value) {
    state[key] = value;
    // The acting alias is session state, not a stored preference:
    // persisting it is what let it survive sign-out.
    if (key === "targetAlias") localStorage.setItem("BH_SOCIAL_HUB_TARGET_ALIAS", value);
    if (key === "heichelId") localStorage.setItem("BH_SOCIAL_HUB_HEICHEL", value);
    if (key === "seriesId") localStorage.setItem("BH_SOCIAL_HUB_SERIES", value);
}
export function setActive(active) { state.active = active; }
export function setResult(key, value) { state.results[key] = value; }
export function setBusy(value) { state.busy = Boolean(value); }
export function setError(value) { state.error = value || ""; }
