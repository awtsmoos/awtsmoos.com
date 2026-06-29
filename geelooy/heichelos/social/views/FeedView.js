// B"H
/**
 * @module FeedView
 * @description
 * Chapter 55: The view now receives a river, not scattered droplets.
 * Raw social content flows through feed state, becomes ordered envelopes, and
 * then reveals profile, composer, feed cards, and comment trees in one shell.
 */
import { AppShell } from '../components/AppShell.js';
import { FeedCard } from '../components/FeedCard.js';
import { ProfileHeader } from '../components/ProfileHeader.js';
import { CommentTree } from '../components/CommentTree.js';
import { Composer } from '../components/Composer.js';
import { buildFeedState } from '../data/feedState.js';

export function FeedView(data = {}, actions = {}) {
    const state = buildFeedState(hasContent(data) ? data : demoData());
    return AppShell([
        ProfileHeader(state.profile),
        Composer({ ...(actions.draft || {}), onSubmit: actions.onSubmit, onAddSection: actions.onAddSection, onRefresh: actions.onRefresh, status: actions.status, statusKind: actions.statusKind }),
        { tag: 'section', props: { class: 'awt-feed-list', id: 'feed' }, children: state.posts.length ? state.posts.map(post => FeedCard(post, actions)) : [{ tag: 'article', props: { class: 'awt-card awt-empty-state' }, children: ['No feed items returned yet.'] }] },
        CommentTree(state.comments)
    ], { notifications: data.notifications, onRefresh: actions.onRefresh });
}

function hasContent(data) {
    return Array.isArray(data.posts) || Array.isArray(data.items) || data.profile || Array.isArray(data.comments);
}

function demoData() {
    return {
        posts: [{
            id: 'demo-post-1',
            title: 'First living feed card',
            author: 'Awtsmoos Builder',
            heichel: 'Heichelos',
            body: 'Images, audio, comments, and series context now have visible vessels.',
            media: ['image', 'audio'],
            createdAt: '2026-06-18T00:00:00.000Z'
        }],
        comments: [{
            author: 'Commenter',
            text: 'This tree has roots.',
            replies: [{ author: 'Reply', text: 'And branches.' }]
        }]
    };
}
