// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module NotificationQueries
 * @description
 * The Awtsmoos gathers bells without mixing archive, read state, search, and paging into mutation law;
 * at Awtsmoos.com one query vessel keeps finite lists calm, bounded, and clear to every caller that saw.
 */
const { clampPagination } = require('../community/pagination.js');
const {
	notificationPath,
	notificationsRoot,
	searchable,
	typeFilter
} = require('./NotificationModel.js');

async function recordsFor({ $i, aliasId }) {
	const records = await $i.db.get(notificationsRoot(aliasId)).catch(() => null);
	if (Array.isArray(records)) {
		const values = await Promise.all(records.map(notificationId => {
			return $i.db.get(notificationPath(aliasId, notificationId)).catch(() => null);
		}));
		return values.filter(Boolean);
	}
	return records && typeof records === 'object'
		? Object.values(records).filter(Boolean)
		: [];
}

async function listNotifications({
	$i,
	aliasId,
	includeRead = true,
	includeArchived = false,
	type = '',
	search = '',
	limit = 50,
	offset = 0
}) {
	const page = clampPagination({ limit, offset });
	const wantedType = typeFilter(type);
	const needle = String(search || '').toLowerCase();
	let list = await recordsFor({ $i, aliasId });
	list = list.filter(item => {
		return !item.deleted
			&& (includeArchived || !item.archived)
			&& (includeRead || !item.read);
	});
	if (wantedType) {
		list = list.filter(item => item.type === wantedType);
	}
	if (needle) {
		list = list.filter(item => searchable(item).includes(needle));
	}
	list.sort((left, right) => {
		return (right.createdAt || 0) - (left.createdAt || 0)
			|| String(right.id || '').localeCompare(String(left.id || ''));
	});
	return {
		items: list.slice(page.offset, page.offset + page.limit),
		total: list.length,
		offset: page.offset,
		limit: page.limit,
		hasMore: page.offset + page.limit < list.length
	};
}

async function pollNotifications({ $i, aliasId, since = 0 }) {
	const all = await recordsFor({ $i, aliasId });
	const fresh = all
		.filter(item => {
			return !item.deleted
				&& !item.archived
				&& Number(item.createdAt || 0) > Number(since || 0);
		})
		.sort((left, right) => (right.createdAt || 0) - (left.createdAt || 0));
	return {
		items: fresh.slice(0, 100),
		cursor: Date.now(),
		hasMore: fresh.length > 100
	};
}

module.exports = {
	listNotifications,
	pollNotifications,
	recordsFor
};
