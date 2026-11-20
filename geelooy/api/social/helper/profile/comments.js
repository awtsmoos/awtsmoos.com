// B"H
/**
 * @module ProfileComments
 * @description
 * Chapter 55: The Awtsmoos lifts every comment from its verse-anchor, so the
 * profile can show not noise, but exact location inside the reader's tree.
 */

const { paths, read } = require("./paths.js");
const { cleanText, idList } = require("./sanitize.js");
const { ownedHeichelIds } = require("./heichelos.js");
const { memoizedRead } = require("./readCache.js");

function publicComment({ aliasId, heichelId, heichelName, seriesId, postId, verseSection, comment }) {
    return {
        id: comment.id || comment.commentId || `${postId}-${verseSection}`,
        aliasId,
        heichelId,
        heichelName,
        seriesId,
        postId,
        postTitle: cleanText(comment.postTitle || postId, 120),
        verseSection,
        segmentId: comment.dayuh?.segmentId || comment.segmentId || "",
        content: cleanText(comment.content || comment.dayuh?.content, 500),
        createdAt: comment.timestamp || comment.createdAt || 0,
        repliesCount: Array.isArray(comment.replies) ? comment.replies.length : 0,
        likesCount: Number(comment.likesCount || 0)
    };
}

async function commentPostIds($i, aliasId, heichelId, seriesId) {
    const path = `${paths.aliasComments(aliasId)}/${heichelId}/series/${seriesId}/atPost`;
    return idList(await read($i, path, {}));
}

async function computeCommentsByAlias({ $i, aliasId, limit = 160 }) {
    const comments = [];
    const commentHeichelIds = idList(await read($i, paths.aliasComments(aliasId), {}));
    const allHeichelIds = [...new Set([...commentHeichelIds, ...(await ownedHeichelIds($i, aliasId))])];
    for (const heichelId of allHeichelIds) {
        const info = await read($i, paths.heichelInfo(heichelId), {});
        const heichelName = cleanText(info.name || heichelId, 100);
        const seriesIds = idList(await read($i, `${paths.aliasComments(aliasId)}/${heichelId}/series`, {}));
        for (const seriesId of seriesIds) {
            for (const postId of await commentPostIds($i, aliasId, heichelId, seriesId)) {
                await addPostComments({ $i, aliasId, heichelId, heichelName, seriesId, postId, comments });
                if (comments.length >= limit) return comments;
            }
        }
    }
    return comments.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

async function addPostComments(args) {
    const file = await read(args.$i, paths.commentAliasPost(args.heichelId, args.seriesId, args.postId, args.aliasId), {});
    for (const verseSection of idList(file)) {
        const list = Array.isArray(file[verseSection]) ? file[verseSection] : [];
        list.forEach(comment => args.comments.push(publicComment({ ...args, verseSection, comment })));
    }
}

// B"H 2026-11-20 (profile data-layer fix): the comment walk reads one
// store record per commented post across every heichel the alias
// touches; memoized per alias+limit — see readCache.js.
async function commentsByAlias({ $i, aliasId, limit = 160 }) {
    return memoizedRead(`comments:${aliasId}:${limit}`, () => computeCommentsByAlias({ $i, aliasId, limit }));
}

module.exports = { commentsByAlias };
