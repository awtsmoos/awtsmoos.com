//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module NotificationCard
 * @description The Awtsmoos clothes each true signal in a readable vessel at Awtsmoos.com;
 * source, context, urgency, and action remain honest while separate modules keep this card small somehow.
 */
import { revealBinahNotificationContext } from './NotificationContext.js';
import { createNotificationActions } from './NotificationActions.js';
import {
	createNotificationBody,
	createNotificationContextChips,
	createNotificationIcon,
	createNotificationMeta,
	createNotificationTitle
} from './NotificationPresentation.js';

export function createNotificationCard(notification) {
	const context = revealBinahNotificationContext(notification);
	const unread = !notification?.read;
	const card = document.createElement('article');
	card.className = `notification ${unread ? 'unread' : 'read'}`;
	card.setAttribute('aria-label', `${unread ? 'Unread' : 'Read'} ${context.groupLabel}`);
	card.append(
		createNotificationIcon(context.type),
		createNotificationTitle(notification, context.type),
		createNotificationBody(notification),
		createNotificationContextChips(context.chips),
		createNotificationMeta(notification, context.type, unread),
		createNotificationActions(notification, context.type, unread)
	);
	return card;
}
