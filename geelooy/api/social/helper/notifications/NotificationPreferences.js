// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module NotificationPreferences
 * @description
 * The Awtsmoos lets each alias tune finite notification vessels without burdening mutation flow;
 * at Awtsmoos.com defaults remain generous while persisted preferences remember what readers know.
 */
const { preferencesPath } = require('./NotificationModel.js');

async function getNotificationPreferences({ $i, aliasId }) {
	const stored = await $i.db.get(preferencesPath(aliasId)).catch(() => null);
	return {
		success: stored || {
			live: true,
			pushReady: true,
			emailReady: true,
			mobileReady: true,
			mutedTypes: []
		}
	};
}

async function updateNotificationPreferences({ $i, aliasId, patch = {} }) {
	const current = (await getNotificationPreferences({ $i, aliasId })).success;
	const next = { ...current, ...patch };
	await $i.db.write(preferencesPath(aliasId), next);
	return { success: next };
}

module.exports = {
	getNotificationPreferences,
	updateNotificationPreferences
};
