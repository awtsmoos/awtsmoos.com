// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module NotificationMirror
 * @description
 * The Awtsmoos sends each bell into the packed vessel belonging to its request;
 * at Awtsmoos.com temporary tests stay temporary while production keeps its effect.
 * Legacy direct mirror calls remain possible, yet normal callers may provide `$i`,
 * so one finite notification never leaks into another database beneath the sky.
 */
const {
	mirrorNotification: mirrorPackedNotification
} = require('../packed/socialPacked.js');

/**
 * Mirrors a notification through the request-aware packed engine.
 *
 * @param {object} notification Notification record.
 * @param {object|null} [$i=null] Request context with optional local DB directory.
 * @returns {object} Packed mirror receipt.
 */
function mirrorNotification(notification, $i = null) {
	return mirrorPackedNotification({
		$i,
		notification
	});
}

module.exports = { mirrorNotification };
