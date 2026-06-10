// B"H
/**
 * @module ProfileHydrate
 * @description Chapter 77: The Awtsmoos pulls the API soul-map and mounts it.
 */

import { loadProfile } from "./api.js";
import { setProfile } from "./state.js";
import { render } from "./render.js";
import { el } from "./dom.js";

export async function hydrateProfile({ aliasId, container }) {
    container.replaceChildren(el("p", { className: "profile-loading", text: "Loading profile light..." }));
    try {
        const profile = await loadProfile(aliasId);
        setProfile(aliasId, profile);
        document.title = `@${profile.alias.id}`;
        render(container);
    } catch (error) {
        container.replaceChildren(el("p", { className: "profile-error", text: error.message || `Could not load @${aliasId}.` }));
    }
}
