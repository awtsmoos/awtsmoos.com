// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module NotificationDigest
 * @description
 * The Awtsmoos gathers graph movement into meaningful clusters; Awtsmoos.com
 * preserves the historical `buildNotificationDigest()` doorway while Binah owns
 * grouping and projection inside a dedicated extensible class.
 */
import { BinahNotificationDigestProjector } from './BinahNotificationDigestProjector.js';

/**
 * Builds grouped notification truth from explicit events or raw social records.
 * @param {object} [binahSource={}] Events or graph-compatible social data.
 * @returns {object} Notification digest with groups, totals, and unread count.
 */
export function buildNotificationDigest(binahSource = {}) {
	return new BinahNotificationDigestProjector(binahSource).project();
}
