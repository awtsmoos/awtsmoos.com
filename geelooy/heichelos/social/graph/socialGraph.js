// B"H
/**
 * @module SocialGraph
 * @description
 * Chapter 68: The social world stops being pages and becomes relation.
 * Alias, post, comment, heichel, series, and media are revealed as nodes with
 * edges between them, so feed, profile, discovery, and notifications can all
 * look at the same living structure from different windows.
 */
import { normalizeContent } from '../data/contentEnvelope.js';

export function buildSocialGraph(data = {}) {
    const graph = createGraph();
    for (const post of data.posts || []) addPost(graph, normalizeContent(post));
    for (const comment of data.comments || []) addComment(graph, normalizeComment(comment));
    return finalizeGraph(graph);
}

function createGraph() {
    return { nodes: new Map(), edges: [] };
}

function addPost(graph, post) {
    const postId = nodeId('post', post.contentId);
    const aliasId = nodeId('alias', post.authorAlias);
    addNode(graph, postId, 'post', { title: post.title, summary: post.summary, createdAt: post.createdAt });
    addNode(graph, aliasId, 'alias', { name: post.authorAlias });
    addEdge(graph, aliasId, postId, 'created');

    if (post.heichelId) {
        const heichelId = nodeId('heichel', post.heichelId);
        addNode(graph, heichelId, 'heichel', { name: post.heichelId });
        addEdge(graph, postId, heichelId, 'in-heichel');
    }
    if (post.seriesId) {
        const seriesId = nodeId('series', post.seriesId);
        addNode(graph, seriesId, 'series', { name: post.seriesId });
        addEdge(graph, postId, seriesId, 'in-series');
    }
    for (const asset of post.assets || []) {
        const assetId = nodeId('media', asset.assetId);
        addNode(graph, assetId, 'media', { kind: asset.kind, label: asset.label, url: asset.url });
        addEdge(graph, postId, assetId, 'has-media');
    }
}

function addComment(graph, comment) {
    const commentId = nodeId('comment', comment.commentId);
    const aliasId = nodeId('alias', comment.authorAlias);
    addNode(graph, commentId, 'comment', { text: comment.text, createdAt: comment.createdAt });
    addNode(graph, aliasId, 'alias', { name: comment.authorAlias });
    addEdge(graph, aliasId, commentId, 'commented');
    if (comment.postId) addEdge(graph, commentId, nodeId('post', comment.postId), 'on-post');
    if (comment.parentCommentId) addEdge(graph, commentId, nodeId('comment', comment.parentCommentId), 'replied-to');
    if (comment.heichelId) addEdge(graph, commentId, nodeId('heichel', comment.heichelId), 'in-heichel');
    if (comment.seriesId) addEdge(graph, commentId, nodeId('series', comment.seriesId), 'in-series');
}

function addNode(graph, id, type, data) {
    if (!graph.nodes.has(id)) graph.nodes.set(id, { id, type, data: { ...data }, degree: 0 });
    else Object.assign(graph.nodes.get(id).data, data);
}

function addEdge(graph, from, to, type) {
    graph.edges.push({ from, to, type });
    bump(graph, from);
    bump(graph, to);
}

function bump(graph, id) {
    const node = graph.nodes.get(id);
    if (node) node.degree += 1;
}

function finalizeGraph(graph) {
    return { nodes: [...graph.nodes.values()], edges: graph.edges };
}

function normalizeComment(comment = {}) {
    return {
        commentId: String(first(comment.commentId, comment.id, 'unknown-comment')),
        postId: String(first(comment.postId, comment.parentId, '')),
        parentCommentId: String(first(comment.parentCommentId, comment.replyTo, '')),
        text: String(first(comment.text, comment.body, comment.content, '')),
        authorAlias: first(comment.authorAlias, comment.author, comment.alias, 'Anonymous alias'),
        heichelId: first(comment.heichelId, comment.heichel, ''),
        seriesId: first(comment.seriesId, comment.series, ''),
        createdAt: first(comment.createdAt, comment.timestamp, '')
    };
}

function nodeId(type, id) {
    return `${type}:${String(id || 'unknown')}`;
}

function first(...values) {
    return values.find(value => value !== undefined && value !== null && value !== '');
}
