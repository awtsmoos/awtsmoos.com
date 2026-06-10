// B"H
/**
 * @module PublicProfileEntry
 * @description Chapter 78: The route gives an alias id; this entry awakens the
 * entire clean profile app.
 */

import { hydrateProfile } from "./hydrate.js";

function aliasFromPath() {
    const direct = document.body.dataset.aliasId;
    if (direct) return direct;
    return decodeURIComponent(location.pathname.replace(/^\/@\/?/, "").replace(/\/$/, ""));
}

const container = document.querySelector("#public-profile-root");
hydrateProfile({ aliasId: aliasFromPath(), container });
