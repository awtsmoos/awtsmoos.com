// B"H
/** @module SocialHubState */
export const state = {
    alias: localStorage.getItem("BH_SOCIAL_HUB_ALIAS") || "ikar",
    targetAlias: localStorage.getItem("BH_SOCIAL_HUB_TARGET_ALIAS") || "ikar",
    heichelId: localStorage.getItem("BH_SOCIAL_HUB_HEICHEL") || "ikar",
    seriesId: localStorage.getItem("BH_SOCIAL_HUB_SERIES") || "root",
    query: "",
    active: "overview",
    results: {},
    busy: false,
    error: ""
};

export function setField(key, value) {
    state[key] = value;
    if (key === "alias") localStorage.setItem("BH_SOCIAL_HUB_ALIAS", value);
    if (key === "targetAlias") localStorage.setItem("BH_SOCIAL_HUB_TARGET_ALIAS", value);
    if (key === "heichelId") localStorage.setItem("BH_SOCIAL_HUB_HEICHEL", value);
    if (key === "seriesId") localStorage.setItem("BH_SOCIAL_HUB_SERIES", value);
}
export function setActive(active) { state.active = active; }
export function setResult(key, value) { state.results[key] = value; }
export function setBusy(value) { state.busy = Boolean(value); }
export function setError(value) { state.error = value || ""; }
