// B"H
/**
 * @module ProfileActivityTree
 * @description
 * Chapter 64: The profile grows branches.
 * Heichel, series, posts, and comments become visible nested vessels so a
 * reader can see not only what an alias said, but where each spark belongs.
 */
import { h } from './render.js';

export function ProfileActivityTree(activity = {}) {
    return h('section', { class: 'awt-panel awt-profile-activity' }, [
        h('h3', {}, ['Posts by Heichel and Series']),
        treeBlock(activity.postsTree || [], renderPost),
        h('h3', {}, ['Comments by Heichel and Series']),
        treeBlock(activity.commentsTree || [], renderComment)
    ]);
}

function treeBlock(tree, renderItem) {
    if (!tree.length) return h('p', { class: 'awt-empty' }, ['No activity yet.']);
    return h('div', { class: 'awt-activity-tree' }, tree.map(heichel => heichelNode(heichel, renderItem)));
}

function heichelNode(heichel, renderItem) {
    return h('article', { class: 'awt-activity-heichel' }, [
        h('h4', {}, [`Heichel: ${heichel.heichelId}`]),
        ...(heichel.series || []).map(series => seriesNode(series, renderItem))
    ]);
}

function seriesNode(series, renderItem) {
    return h('div', { class: 'awt-activity-series' }, [
        h('strong', {}, [`Series: ${series.seriesId}`]),
        h('ul', {}, (series.items || []).map(item => h('li', {}, [renderItem(item)])))
    ]);
}

function renderPost(post) {
    return h('span', { class: 'awt-activity-item' }, [post.title || post.summary || post.id]);
}

function renderComment(comment) {
    return h('span', { class: 'awt-activity-item' }, [comment.text || comment.id]);
}
