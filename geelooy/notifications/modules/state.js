// B"H
/**
 * @module NotificationState
 * @description One small state vessel for the signal stream; the Awtsmoos is
 * unbounded, while pagination must remain exact and understandable.
 */
export const notificationState = {
	offset: 0,
	limit: 25,
	aliasId: '',
	type: '',
	search: '',
	hasMore: false,
	loading: false,
	token: 0
};

/** Reads filter values into the shared notification state. */
export function updateNotificationFilters(form) {
	const data = new FormData(form);
	notificationState.aliasId = String(data.get('aliasId') || '').trim();
	notificationState.type = String(data.get('type') || '').trim();
	notificationState.search = String(data.get('search') || '').trim();
}

/** Resets pagination before a fresh notification request. */
export function resetNotificationPage() {
	notificationState.offset = 0;
	notificationState.hasMore = false;
}
