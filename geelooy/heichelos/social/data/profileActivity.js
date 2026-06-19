// B"H
/**
 * @module ProfileActivity
 * @description
 * Chapter 63: The alias remembers where every spark was placed.
 * Posts and comments are gathered under heichel and series branches, so a
 * profile can reveal its work as a tree instead of a scattered floor of leaves.
 */
import { normalizeContent } from './contentEnvelope.js';

export function buildProfileActivity(data = {}) {
    const posts = (data.posts || []).map(post => normalizeContent(post));
    const comments = (data.comments || []).map(normalizeComment);
    return {
        postsTree: groupItems(posts, postNode),
        commentsTree: groupItems(comments, commentNode),
        totals: { posts: posts.length, comments: comments.length }
    };
}

export function groupPostsByHeichelAndSeries(posts = []) {
    return groupItems(posts.map(post => normalizeContent(post)), postNode);
}

export function groupCommentsByHeichelSeriesTree(comments = []) {
    return groupItems(comments.map(normalizeComment), commentNode);
}

function groupItems(items, toNode) {
    const heichelMap = new Map();
    for (const item of items) {
        const heichelId = item.heichelId || 'unassigned-heichel';
        const seriesId = item.seriesId || 'loose-series';
        const heichel = getOrCreate(heichelMap, heichelId, () => ({ heichelId, series: new Map() }));
        const series = getOrCreate(heichel.series, seriesId, () => ({ seriesId, items: [] }));
        series.items.push(toNode(item));
    }
    return [...heichelMap.values()].map(heichel => ({
        heichelId: heichel.heichelId,
        series: [...heichel.series.values()]
    }));
}

function normalizeComment(comment = {}) {
    return {
        commentId: String(first(comment.commentId, comment.id, 'unknown-comment')),
        postId: String(first(comment.postId, comment.parentId, 'unknown-post')),
        text: String(first(comment.text, comment.body, comment.content, '')),
        authorAlias: first(comment.authorAlias, comment.author, comment.alias, 'Anonymous alias'),
        heichelId: first(comment.heichelId, comment.heichel, ''),
        seriesId: first(comment.seriesId, comment.series, ''),
        createdAt: first(comment.createdAt, comment.timestamp, '')
    };
}

function postNode(post) {
    return {
        type: 'post',
        id: post.contentId,
        title: post.title,
        summary: post.summary,
        createdAt: post.createdAt
    };
}

function commentNode(comment) {
    return {
        type: 'comment',
        id: comment.commentId,
        postId: comment.postId,
        text: comment.text,
        authorAlias: comment.authorAlias,
        createdAt: comment.createdAt
    };
}

function getOrCreate(map, key, create) {
    if (!map.has(key)) map.set(key, create());
    return map.get(key);
}

function first(...values) {
    return values.find(value => value !== undefined && value !== null && value !== '');
}
