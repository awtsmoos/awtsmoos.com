// B"H
/**
 * @module GeelooyNotificationsEntry
 * @description Opens the signal stream after the document is ready.
 */
import { bootNotifications } from './modules/controller.js';

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', () => bootNotifications(), { once: true });
} else {
	bootNotifications();
}
