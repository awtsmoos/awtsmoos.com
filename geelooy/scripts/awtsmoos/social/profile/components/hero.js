// B"H
/**
 * @module ProfileHero
 * @description Chapter 66: Banner, avatar, name, bio, and actions become one
 * clean mobile portrait instead of clutter.
 */

import { el, clean } from "../dom.js";

export function hero(profile) {
    const name = clean(profile.profile.displayName || profile.alias.name);
    return el("section", { className: "profile-hero" }, [
        el("div", { className: "profile-banner", attrs: profile.profile.banner ? { style: `background-image:url('${clean(profile.profile.banner)}')` } : {} }),
        el("div", { className: "profile-identity" }, [
            el("div", { className: "profile-avatar", text: name.slice(0, 1) || "A" }),
            el("div", { className: "profile-copy", html: `<h1>${name}</h1><p>@${clean(profile.alias.id)}</p><p>${clean(profile.profile.bio || "A quiet profile gathering light.")}</p>` }),
            el("a", { className: "profile-action-main", text: "Message", attrs: { href: `/email?to=${encodeURIComponent(profile.alias.id)}` } })
        ])
    ]);
}
