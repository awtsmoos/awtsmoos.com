// B"H
/**
 * @module ProfileCommentCard
 * @description Chapter 70: Comments show their Heichel, post, verse, segment,
 * and reader route without drowning the mobile screen.
 */

import { el, clean } from "../dom.js";

export function commentCard(comment) {
    const segment = comment.segmentId ? ` · Segment ${clean(comment.segmentId)}` : "";
    return el("article", {
        className: "profile-comment-card",
        html: `<small>${clean(comment.heichelName)} › ${clean(comment.postTitle || comment.postId)}</small><p>${clean(comment.content)}</p><footer>${clean(comment.verseSection)}${segment}</footer>`,
        on: { click: () => { location.href = `/heichelos/${encodeURIComponent(comment.heichelId)}/series/${encodeURIComponent(comment.seriesId)}/${encodeURIComponent(comment.postId)}?verse=${encodeURIComponent(comment.verseSection)}`; } }
    });
}
