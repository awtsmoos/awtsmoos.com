// B"H
/**
 * @module SocialFeedState
 * @description
 * Chapter 53: The feed learns order without forgetting mercy.
 * The Awtsmoos arranges raw posts into normalized vessels, newest first when
 * time is known, stable when time is hidden, and ready for profile/feed views.
 */
import { normalizeContent } from './contentEnvelope.js';

export function buildFeedState(data = {}) {
    const posts = normalizeFeedItems(data.posts || data.items || []);
    return {
        profile: normalizeProfile(data.profile || {}, posts),
        posts,
        comments: Array.isArray(data.comments) ? data.comments : [],
        meta: data.meta || {}
    };
}

export function normalizeFeedItems(items = []) {
    return items
        .map((item, index) => ({ item: normalizeContent(item), index }))
        .sort(sortByCreatedAtDesc)
        .map(entry => entry.item);
}

function normalizeProfile(profile, posts) {
    const fallbackName = posts[0]?.authorAlias || 'Builder Alias';
    return {
        name: profile.name || profile.alias || fallbackName,
        bio: profile.bio || profile.description || 'Living in the unfolding story.',
        posts: numberOr(profile.posts, posts.length),
        comments: numberOr(profile.comments, 0),
        heichelos: numberOr(profile.heichelos, 0)
    };
}

function sortByCreatedAtDesc(a, b) {
    const left = Date.parse(a.item.createdAt || '');
    const right = Date.parse(b.item.createdAt || '');
    const leftKnown = Number.isFinite(left);
    const rightKnown = Number.isFinite(right);
    if (leftKnown && rightKnown && right !== left) return right - left;
    if (leftKnown !== rightKnown) return leftKnown ? -1 : 1;
    return a.index - b.index;
}

function numberOr(value, fallback) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
}
