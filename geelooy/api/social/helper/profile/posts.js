// B"H
/**
 * @module ProfilePosts
 * @description
 * Chapter 110: The profile reads all three ages of Geelooy posts.
 *
 * First it drinks from the new AwtsmoosDB all-posts census. Then it falls back
 * to legacy `postsSubmitted` indexes and finally to connected series scans.
 * Thus @rambam-era posts and freshly migrated posts both appear.
 */

const { paths, read } = require("./paths.js");
const { cleanText, idList } = require("./sanitize.js");
const { ownedHeichelIds, relevantHeichelIds } = require("./heichelos.js");
const { allPosts } = require("../packed/allPostsIndex.js");

function mergeIds(...groups) {
    return [...new Set(groups.flat().filter(Boolean).map(String))];
}

async function postIds($i, heichelId) {
    const indexed = idList(await read($i, paths.heichelPostIds(heichelId), {}));
    const legacy = idList(await read($i, paths.heichelPosts(heichelId), {}));
    const seriesIds = idList(await read($i, paths.seriesRoot(heichelId), {}));
    const seriesPosts = [];
    for (const seriesId of seriesIds) seriesPosts.push(...idList(await read($i, paths.seriesPosts(heichelId, seriesId), {})));
    return mergeIds(indexed, legacy, seriesPosts);
}

async function submittedPostCoordinates($i, aliasId) {
    const output = [];
    const heichelRoot = await read($i, `/social/aliases/${aliasId}/postsSubmitted/inHeichel`, {});
    for (const heichelId of idList(heichelRoot)) {
        const seriesRoot = await read($i, `/social/aliases/${aliasId}/postsSubmitted/inHeichel/${heichelId}/inSeries`, {});
        for (const seriesId of idList(seriesRoot)) {
            const postRoot = await read($i, `/social/aliases/${aliasId}/postsSubmitted/inHeichel/${heichelId}/inSeries/${seriesId}`, {});
            for (const postId of idList(postRoot)) output.push({ heichelId, seriesId, postId });
        }
    }
    return output;
}

function authorOf(post) {
    return post?.author || post?.aliasId || post?.by || post?.dayuh?.author || "";
}

function seriesOf(post, fallback = "root") {
    return post?.seriesId || post?.parentSeriesId || post?.dayuh?.seriesId || fallback || "root";
}

function publicPost({ post, postId, heichelId, heichelName, fallbackSeriesId }) {
    return {
        id: postId,
        postId,
        heichelId,
        heichelName,
        seriesId: seriesOf(post, fallbackSeriesId),
        title: cleanText(post.title || post.name || postId, 120),
        excerpt: cleanText(post.content || post.description || post.dayuh?.content || post.excerpt || "", 260),
        contentType: post.contentType || post.type || "post",
        sectionsCount: Array.isArray(post.sections) ? post.sections.length : 0,
        commentsCount: 0,
        createdAt: post.createdAt || post.timestamp || post.updatedAt || 0,
        updatedAt: post.updatedAt || 0
    };
}

async function addPostIfAuthored({ $i, aliasId, heichelId, postId, fallbackSeriesId, posts, seen }) {
    const key = `${heichelId}/${postId}`;
    if (seen.has(key)) return;
    const post = await read($i, paths.post(heichelId, postId), null);
    if (!post || authorOf(post) !== aliasId) return;
    const info = await read($i, paths.heichelInfo(heichelId), {});
    posts.push(publicPost({ post, postId, heichelId, heichelName: cleanText(info.name || heichelId, 100), fallbackSeriesId }));
    seen.add(key);
}

async function addPackedPost({ $i, aliasId, packed, posts, seen }) {
    if (!packed || packed.aliasId !== aliasId) return;
    const key = `${packed.heichelId}/${packed.postId}`;
    if (seen.has(key)) return;
    const info = await read($i, paths.heichelInfo(packed.heichelId), {});
    posts.push(publicPost({ post: packed, postId: packed.postId, heichelId: packed.heichelId, heichelName: cleanText(info.name || packed.heichelId, 100), fallbackSeriesId: packed.seriesId }));
    seen.add(key);
}

async function postsByAlias({ $i, aliasId, limit = 240 }) {
    const posts = [];
    const seen = new Set();
    for (const packed of allPosts({ $i, aliasId, limit })) await addPackedPost({ $i, aliasId, packed, posts, seen });
    for (const coord of await submittedPostCoordinates($i, aliasId)) {
        await addPostIfAuthored({ $i, aliasId, ...coord, fallbackSeriesId: coord.seriesId, posts, seen });
        if (posts.length >= limit) return sortPosts(posts);
    }
    const heichelIds = mergeIds(await relevantHeichelIds($i, aliasId), await ownedHeichelIds($i, aliasId));
    for (const heichelId of heichelIds) for (const postId of await postIds($i, heichelId)) {
        await addPostIfAuthored({ $i, aliasId, heichelId, postId, posts, seen });
        if (posts.length >= limit) return sortPosts(posts);
    }
    return sortPosts(posts);
}

function sortPosts(posts) {
    return posts.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

module.exports = { postsByAlias, postIds, submittedPostCoordinates };
