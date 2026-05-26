//B"H
/**
 * @module notificationsPanel
 * @description Compact mobile/desktop notification bell for heichel pages.
 */

import {
    listNotifications,
    markNotificationRead,
    pollNotifications
} from '../api/notifications.js';

export function mountNotificationsPanel({ root = document.body, aliasId } = {}) {
    if (!root || !aliasId || document.querySelector('.awtsmoos-notifications-panel')) return null;

    const panel = document.createElement('aside');
    panel.className = 'awtsmoos-notifications-panel';
    panel.setAttribute('aria-label', 'Social notifications');

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'awtsmoos-notifications-toggle';
    toggle.textContent = 'Notifications';
    toggle.setAttribute('aria-expanded', 'false');
    panel.appendChild(toggle);

    const list = document.createElement('div');
    list.className = 'awtsmoos-notifications-list';
    list.hidden = true;
    panel.appendChild(list);

    root.appendChild(panel);
    const ctx = { aliasId, list, toggle, cursor: 0, pollTimer: null };
    toggle.onclick = async () => {
        list.hidden = !list.hidden;
        toggle.setAttribute('aria-expanded', String(!list.hidden));
        if (!list.hidden) await refreshNotifications(ctx);
    };
    refreshNotifications(ctx);
    ctx.pollTimer = window.setInterval(() => refreshNotificationPoll(ctx), 12000);
    return panel;
}

async function refreshNotifications(ctx) {
    const response = await listNotifications({ aliasId: ctx.aliasId });
    const notifications = Array.isArray(response?.success) ? response.success : [];
    ctx.toggle.textContent = notifications.length ? `Notifications (${notifications.length})` : 'Notifications';
    renderNotifications(ctx, notifications);
}

function renderNotifications(ctx, notifications) {
    ctx.list.replaceChildren();
    if (!notifications.length) {
        const empty = document.createElement('div');
        empty.className = 'awtsmoos-notifications-empty';
        empty.textContent = 'No unread notifications.';
        ctx.list.appendChild(empty);
        return;
    }

    notifications.forEach(note => {
        const card = document.createElement('article');
        card.className = 'awtsmoos-notification-card';

        const title = document.createElement('strong');
        title.textContent = note.title || note.type || 'Notification';
        card.appendChild(title);

        const body = document.createElement('p');
        body.textContent = note.body || '';
        card.appendChild(body);

        const actions = document.createElement('div');
        actions.className = 'awtsmoos-notification-actions';
        if (note.actionUrl) {
            const open = document.createElement('a');
            open.href = note.actionUrl;
            open.textContent = 'Open';
            actions.appendChild(open);
        }
        const read = document.createElement('button');
        read.type = 'button';
        read.textContent = 'Mark read';
        read.onclick = async () => {
            await markNotificationRead({ aliasId: ctx.aliasId, notificationId: note.id });
            await refreshNotifications(ctx);
        };
        actions.appendChild(read);
        card.appendChild(actions);
        ctx.list.appendChild(card);
    });
}


async function refreshNotificationPoll(ctx) {
    const response = await pollNotifications({ aliasId: ctx.aliasId, since: ctx.cursor || 0 });
    if (response?.cursor) ctx.cursor = response.cursor;
    if (Array.isArray(response?.success) && response.success.length) {
        await refreshNotifications(ctx);
    }
}
