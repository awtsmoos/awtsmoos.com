// B"H
/**
 * @module ProfileStats
 * @description
 * Chapter 57: The Awtsmoos counts the sparks without cluttering the page.
 */

function countSeries(nodes = []) {
    return nodes.reduce((sum, node) => sum + 1 + countSeries(node.children || []), 0);
}

function profileStats({ posts = [], comments = [], heichelos = [], tree = [] }) {
    return {
        posts: posts.length,
        comments: comments.length,
        heichelos: heichelos.length,
        series: tree.reduce((sum, root) => sum + countSeries(root.children || []), 0),
        followers: 0,
        following: 0,
        likesReceived: comments.reduce((sum, comment) => sum + Number(comment.likesCount || 0), 0)
    };
}

module.exports = { profileStats, countSeries };
