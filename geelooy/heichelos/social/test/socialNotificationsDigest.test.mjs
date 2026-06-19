// B"H
/**
 * Chapter 85: The notification digest is tested as grouped social motion.
 * The Awtsmoos gathers raw graph events into readable notification clusters,
 * then reveals them in the shell as a quiet inbox of living movement.
 */
import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { buildNotificationDigest } from '../notifications/notificationDigest.js';
import { NotificationsView } from '../views/NotificationsView.js';

const styleIndex = readFileSync('geelooy/heichelos/social/styles/index.css', 'utf8');
assert.ok(styleIndex.includes('notifications.css'), 'social style index imports notification styles');

const data = {
    posts: [{
        id: 'notify-post-1',
        title: 'Notify Post',
        author: 'Notify Alias',
        heichel: 'Notify Heichel',
        seriesId: 'Notify Series',
        media: [{ id: 'notify-image-1', mime: 'image/png', name: 'notify.png' }]
    }],
    comments: [{
        id: 'notify-comment-1',
        postId: 'notify-post-1',
        text: 'Notify comment',
        author: 'Comment Alias',
        heichel: 'Notify Heichel',
        seriesId: 'Notify Series'
    }, {
        id: 'notify-comment-2',
        postId: 'notify-post-1',
        replyTo: 'notify-comment-1',
        text: 'Notify reply',
        author: 'Reply Alias',
        heichel: 'Notify Heichel',
        seriesId: 'Notify Series'
    }]
};

const digest = buildNotificationDigest(data);
assert.ok(digest.unreadCount > 0);
assert.ok(digest.groups.some(group => group.type === 'created'));
assert.ok(digest.groups.some(group => group.type === 'commented'));
assert.ok(digest.groups.some(group => group.type === 'on-post'));
assert.ok(digest.groups.some(group => group.type === 'replied-to'));
assert.ok(digest.groups.some(group => group.type === 'has-media'));
assert.equal(digest.totals.created, 1);
assert.equal(digest.totals.commented, 2);
assert.equal(digest.totals['on-post'], 2);
assert.equal(digest.totals['replied-to'], 1);
assert.equal(digest.totals['has-media'], 1);

const view = NotificationsView(data);
assert.ok(containsText(view, 'Notifications'));
assert.ok(containsText(view, 'Unread:'));
assert.ok(containsText(view, 'Notify Alias created'));
assert.ok(containsText(view, 'Comment Alias commented'));
assert.ok(containsText(view, 'Reply Alias commented'));
assert.ok(containsText(view, 'reply'));
assert.ok(containsText(view, 'Notify Post'));
assert.ok(containsText(view, 'notify.png'));

console.log('B"H social notifications digest passed');

function containsText(node, text) {
    if (typeof node === 'string') return node.includes(text);
    if (!node || typeof node !== 'object') return false;
    if (Array.isArray(node)) return node.some(child => containsText(child, text));
    return Object.values(node).some(value => containsText(value, text));
}
