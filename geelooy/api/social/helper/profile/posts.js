// B"H
/**
 * @module ProfilePosts
 * @description
 * Chapter 54: The Awtsmoos draws every authored post out of its Heichel chamber
 * and returns compact cards for the profile flame.
 */

const { paths, read } = require("./paths.js");
const { cleanText, idList } = require("./sanitize.js");
const { ownedHeichelIds } = require("./heichelos.js");

async function postIds($i, heichelId) {
    const indexed = idList(await read($i, paths.heichelPostIds(heichelId), {}));
    const legacy = idList(await read($i, paths.heichelPosts(heichelId), {}));
    return [...new Set([...indexed, ...legacy])];
}

function publicPost({ post, postId, heichelId, heichelName }) {
    return {
        id: postId,
        postId,
        heichelId,
        heichelName,
        seriesId: post.seriesId || post.parentSeriesId || "root",
        title: cleanText(post.title || postId, 120),
        excerpt: cleanText(post.content || post.description, 260),
        contentType: post.contentType || "post",
        sectionsCount: Array.isArray(post.sections) ? post.sections.length : 0,
        commentsCount: 0,
        createdAt: post.createdAt || 0,
        updatedAt: post.updatedAt || 0
    };
}

async function postsByAlias({ $i, aliasId, limit = 120 }) {
    const posts = [];
    for (const heichelId of await ownedHeichelIds($i, aliasId)) {
        const info = await read($i, paths.heichelInfo(heichelId), {});
        const heichelName = cleanText(info.name || heichelId, 100);
        for (const postId of await postIds($i, heichelId)) {
            const post = await read($i, paths.post(heichelId, postId), null);
            if (!post || (post.aliasId || post.author) !== aliasId) continue;
            posts.push(publicPost({ post, postId, heichelId, heichelName }));
            if (posts.length >= limit) return sortPosts(posts);
        }
    }
    return sortPosts(posts);
}

function sortPosts(posts) {
    return posts.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

module.exports = { postsByAlias, postIds };
