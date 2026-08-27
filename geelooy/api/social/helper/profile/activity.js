// B"H
/**
 * @module ProfileActivity
 * @description
 * Chapter 58: Recent activity becomes a quiet river, not clutter.
 */

function normalizeActivityPost(post) {
    return { kind: "post", id: post.id, title: post.title, heichelId: post.heichelId, createdAt: post.createdAt || 0, source: post };
}

function normalizeActivityComment(comment) {
    return { kind: "comment", id: comment.id, title: comment.content.slice(0, 80), heichelId: comment.heichelId, createdAt: comment.createdAt || 0, source: comment };
}

function recentActivity({ posts = [], comments = [], limit = 16 }) {
    return [...posts.slice(0, limit).map(normalizeActivityPost), ...comments.slice(0, limit).map(normalizeActivityComment)]
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
        .slice(0, limit);
}

module.exports = { recentActivity };
