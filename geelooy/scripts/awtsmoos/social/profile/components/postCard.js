// B"H
/**
 * @module ProfilePostCard
 * @description Chapter 69: Each post card is brief, anchored, and openable.
 */

import { el, clean } from "../dom.js";

export function postCard(post) {
    return el("article", {
        className: "profile-post-card",
        html: `<small>${clean(post.heichelName)} › ${clean(post.seriesId)}</small><h3>${clean(post.title)}</h3><p>${clean(post.excerpt)}</p><footer>${post.sectionsCount || 0} sections · ${clean(post.contentType)}</footer>`,
        on: { click: () => { location.href = `/heichelos/${encodeURIComponent(post.heichelId)}/series/${encodeURIComponent(post.seriesId)}/${encodeURIComponent(post.postId)}`; } }
    });
}
