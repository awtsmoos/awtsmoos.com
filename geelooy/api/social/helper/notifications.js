//B"H
/**
 * @module notifications
 * @description
 * Small durable notification vessels for social events: replies, answers,
 * reposts, shares, approvals and chat. Stored per alias so mobile and desktop
 * UI can read the same truth.
 */

const { sp } = require('./_awtsmoos.constants.js');
const { er } = require('./general.js');
const { mirrorNotification } = require('./packed/socialPacked.js');

const NOTIFICATION_TYPES = [
    'reply',
    'comment',
    'answer',
    'repost',
    'share',
    'mention',
    'approval',
    'chat',
    'system'
];

function clean(value, fallback = '') {
    return String(value || fallback).trim();
}

function notificationRoot(aliasId) {
    return `${sp}/aliases/${aliasId}/notifications`;
}

function notificationPath(aliasId, notificationId) {
    return `${notificationRoot(aliasId)}/${notificationId}`;
}

function makeNotificationId(type) {
    return `BH_note_${type}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

function normalizeType(type) {
    const candidate = clean(type || 'system');
    return NOTIFICATION_TYPES.includes(candidate) ? candidate : 'system';
}

function publicNotification(record) {
    return record && typeof record === 'object' ? record : null;
}

async function createNotification({ $i, toAliasId, fromAliasId = '', type = 'system', title = '', body = '', entity = {}, actionUrl = '' }) {
    const target = clean(toAliasId);
    if (!target) return er({ code: 'MISSING_ALIAS', message: 'Notification target alias is required.' });
    const kind = normalizeType(type);
    const id = makeNotificationId(kind);
    const record = {
        id,
        type: kind,
        toAliasId: target,
        fromAliasId: clean(fromAliasId),
        title: clean(title || kind),
        body: clean(body),
        entity: entity && typeof entity === 'object' ? entity : {},
        actionUrl: clean(actionUrl),
        read: false,
        createdAt: Date.now(),
        readAt: null
    };
    await $i.db.write(notificationPath(target, id), record);
    mirrorNotification({ $i, notification: record });
    return { success: record };
}

async function listNotifications({ $i, aliasId, includeRead = false }) {
    const target = clean(aliasId || $i.$_GET?.aliasId);
    if (!target) return er({ code: 'MISSING_ALIAS', message: 'aliasId is required.' });
    const records = await $i.db.get(notificationRoot(target)).catch(() => null);
    let list = [];
    if (Array.isArray(records)) {
        for (const id of records) {
            const child = await $i.db.get(notificationPath(target, id)).catch(() => null);
            if (child) list.push(child);
        }
    } else if (records && typeof records === 'object') {
        list = Object.values(records).map(publicNotification).filter(Boolean);
    }
    if (!includeRead) list = list.filter(item => !item.read);
    list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    return { success: list };
}

async function markNotificationRead({ $i, aliasId, notificationId }) {
    const target = clean(aliasId || $i.$_POST?.aliasId);
    const id = clean(notificationId || $i.$_POST?.notificationId);
    if (!target || !id) return er({ code: 'MISSING_PARAMS', message: 'aliasId and notificationId are required.' });
    const path = notificationPath(target, id);
    const record = await $i.db.get(path).catch(() => null);
    if (!record) return er({ code: 'NOT_FOUND', message: 'Notification not found.' });
    const next = { ...record, read: true, readAt: Date.now() };
    await $i.db.write(path, next);
    return { success: next };
}

async function countUnreadNotifications({ $i, aliasId }) {
    const listed = await listNotifications({ $i, aliasId, includeRead: false });
    if (!listed.success) return listed;
    return { success: { count: listed.success.length } };
}

async function pollNotifications({ $i, aliasId, since = 0 }) {
    const listed = await listNotifications({ $i, aliasId, includeRead: true });
    if (!listed.success) return listed;
    const sinceNumber = Number(since || 0);
    return {
        success: listed.success.filter(item => Number(item.createdAt || 0) > sinceNumber),
        cursor: Date.now()
    };
}

async function fanoutNotification({ $i, toAliases = [], fromAliasId = '', type = 'system', title = '', body = '', entity = {}, actionUrl = '' }) {
    const targets = Array.isArray(toAliases)
        ? toAliases
        : String(toAliases || '').split(',').map(item => item.trim()).filter(Boolean);
    if (!targets.length) return er({ code: 'MISSING_TARGETS', message: 'At least one target alias is required.' });
    const created = [];
    for (const toAliasId of [...new Set(targets)]) {
        const result = await createNotification({ $i, toAliasId, fromAliasId, type, title, body, entity, actionUrl });
        if (result.success) created.push(result.success);
    }
    return { success: created };
}

module.exports = {
    NOTIFICATION_TYPES,
    createNotification,
    listNotifications,
    markNotificationRead,
    countUnreadNotifications,
    pollNotifications,
    fanoutNotification
};
