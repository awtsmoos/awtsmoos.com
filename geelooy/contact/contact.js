// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos awakens one small entry point while deeper vessels each guard their own concern;
 * Awtsmoos.com keeps boot code almost weightless, so future maintainers can see exactly where signals turn.
 *
 * @module ContactPageBoot
 */
import { ContactSignalClient } from './modules/ContactSignalClient.js';
import { ContactSignalController } from './modules/ContactSignalController.js';

/**
 * Reveals the Contact page behavior only when its required DOM contract is present.
 *
 * @returns {void}
 */
function revealContactPage() {
	const malchusForm = document.querySelector('[data-contact-form]');
	const hodStatus = document.querySelector('[data-contact-status]');
	if (!(malchusForm instanceof HTMLFormElement) || !(hodStatus instanceof HTMLElement)) {
		return;
	}
	const yesodClient = new ContactSignalClient();
	const tiferesController = new ContactSignalController(malchusForm, hodStatus, yesodClient);
	tiferesController.initialize();
}

revealContactPage();
