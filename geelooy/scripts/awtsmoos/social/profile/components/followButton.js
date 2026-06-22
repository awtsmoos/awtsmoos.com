// B"H
/**
 * @module ProfileFollowButton
 * @description
 * Chapter 439: Following becomes a small covenant button. If the viewer alias is
 * unknown, the button explains itself instead of pretending auth exists.
 */

import { el } from "../dom.js";
import { followEntity, unfollowEntity } from "../api.js";

function isFollowing(follows = [], aliasId) {
    return follows.some(item => item.type === "alias" && item.id === aliasId);
}

export function followButton({ profile, viewerAliasId, follows, onChange }) {
    const target = profile.alias.id;
    if (!viewerAliasId || viewerAliasId === target) {
        return el("button", { className: "profile-follow-button passive", text: viewerAliasId === target ? "Your profile" : "Sign in to follow", attrs: { type: "button", disabled: "disabled" } });
    }
    const active = isFollowing(follows, target);
    return el("button", {
        className: `profile-follow-button ${active ? "following" : ""}`,
        text: active ? "Following" : "Follow",
        attrs: { type: "button", "aria-pressed": active ? "true" : "false" },
        on: { click: async event => {
            event.preventDefault();
            event.currentTarget.disabled = true;
            try {
                if (active) await unfollowEntity(viewerAliasId, "alias", target);
                else await followEntity(viewerAliasId, "alias", target);
                await onChange?.();
            } finally {
                event.currentTarget.disabled = false;
            }
        } }
    });
}
