// B"H
/**
 * @module ProfileView
 * @description
 * Chapter 65: The profile becomes a mapped city.
 * Header, totals, posts, and comments now flow through the activity tree so
 * a visitor sees each contribution beneath its heichel and series chamber.
 */
import { AppShell } from '../components/AppShell.js';
import { ProfileHeader } from '../components/ProfileHeader.js';
import { ProfileActivityTree } from '../components/ProfileActivityTree.js';
import { buildProfileActivity } from '../data/profileActivity.js';

export function ProfileView(data = {}) {
    const activity = buildProfileActivity(data);
    const profile = normalizeProfile(data.profile || {}, activity.totals);
    return AppShell([
        ProfileHeader(profile),
        ProfileActivityTree(activity)
    ]);
}

function normalizeProfile(profile, totals) {
    return {
        name: profile.name || profile.alias || 'Alias',
        bio: profile.bio || profile.description || 'Posts and comments organized by heichel and series.',
        posts: Number.isFinite(Number(profile.posts)) ? Number(profile.posts) : totals.posts,
        comments: Number.isFinite(Number(profile.comments)) ? Number(profile.comments) : totals.comments,
        heichelos: Number.isFinite(Number(profile.heichelos)) ? Number(profile.heichelos) : 0
    };
}
