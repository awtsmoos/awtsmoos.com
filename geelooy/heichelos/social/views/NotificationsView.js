// B"H
/**
 * @module NotificationsView
 * @description
 * Chapter 82: The notification chamber opens from the graph itself.
 * Timeline events become grouped digests and the shell reveals them as a
 * readable inbox of social motion.
 */
import { AppShell } from '../components/AppShell.js';
import { NotificationDigest } from '../components/NotificationDigest.js';
import { buildNotificationDigest } from '../notifications/notificationDigest.js';

export function NotificationsView(data = {}) {
    const digest = buildNotificationDigest(hasNotificationData(data) ? data : demoData());
    return AppShell([NotificationDigest(digest)]);
}

function hasNotificationData(data) {
    return Array.isArray(data.events) || Array.isArray(data.posts) || Array.isArray(data.comments);
}

function demoData() {
    return {
        posts: [{
            id: 'notify-post',
            title: 'Notification source post',
            author: 'Notify Alias',
            heichel: 'Notify Heichel',
            media: [{ id: 'notify-image', mime: 'image/png', name: 'notice.png' }]
        }],
        comments: [{
            id: 'notify-comment',
            postId: 'notify-post',
            text: 'A notification appears.',
            author: 'Notify Commenter',
            heichel: 'Notify Heichel'
        }]
    };
}
